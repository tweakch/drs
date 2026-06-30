// Analytics engine — ported from the prototype (wohlen-race-analysis.html) and
// golden-master tested against its own output. Pure: no React/DOM/Next, no module
// globals. Tags (driver/kart per stint) are passed in, not stored.

import type {
  CleanResult,
  DriverBoard,
  DriverRow,
  EffectsModel,
  Insight,
  KartRow,
  RawLaps,
  Reco,
  Stint,
  StintTier,
  Tags,
  TeamAnalysis,
} from './types';

// 10-colour team rotation, ported verbatim — assigns colours by team index.
export const PAL = [
  '#ff5a3c',
  '#3ea7ff',
  '#3ddc91',
  '#ffc23c',
  '#b07cff',
  '#ff7eb6',
  '#5ce0d8',
  '#f0844a',
  '#9aa0ff',
  '#7ad14e',
];

// Track personal-best reference for the "vs PB" insight (prototype constant).
export const TRACK_PB = 53.103;

// ---- stats helpers ----
export const mean = (a: number[]): number => a.reduce((x, y) => x + y, 0) / a.length;

export const median = (a: number[]): number => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export const std = (a: number[]): number => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1));
};

/** Linear-interpolated [Q1, Q2, Q3]. */
export function quartiles(a: number[]): [number, number, number] {
  const s = [...a].sort((x, y) => x - y);
  const q = (p: number) => {
    const i = (s.length - 1) * p;
    const lo = Math.floor(i);
    return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo);
  };
  return [q(0.25), q(0.5), q(0.75)];
}

// ---- input parsing ----
/** Parse "m:ss.sss" or decimal seconds to a float; null when unreadable. */
export function parseTime(str: string): number | null {
  str = str.trim();
  if (!str) return null;
  if (str.includes(':')) {
    const [m, s] = str.split(':');
    return +m * 60 + parseFloat(s);
  }
  const v = parseFloat(str);
  return isNaN(v) ? null : v;
}

/** Parse pasted lap data: CSV `Kart,Lap,Time` or freeform `Name: t, t, t`. */
export function parseInput(text: string): RawLaps {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const karts: RawLaps = {};
  const looksCsv =
    lines.length > 1 && lines.every((l) => l.split(/[,;\t]/).length === 3) && /lap/i.test(lines[0]);
  if (looksCsv) {
    for (let i = 1; i < lines.length; i++) {
      const [k, , t] = lines[i].split(/[,;\t]/).map((x) => x.trim());
      const v = parseTime(t);
      if (v == null) continue;
      (karts[k] = karts[k] || []).push(v);
    }
    return karts;
  }
  for (const line of lines) {
    let name: string, rest: string;
    if (line.includes(':') && /[a-zA-Z]/.test(line.split(':')[0].replace(/\s/g, ''))) {
      const idx = line.indexOf(':');
      name = line.slice(0, idx).trim();
      rest = line.slice(idx + 1);
    } else {
      name = 'Kart ' + (Object.keys(karts).length + 1);
      rest = line;
    }
    const times = rest
      .split(/[,; \t]+/)
      .map(parseTime)
      .filter((v): v is number => v != null);
    if (times.length) (karts[name] = karts[name] || []).push(...times);
  }
  return karts;
}

// ---- lap processing ----
/** Remove pit/traffic outliers via the IQR fence (slow side). */
export function cleanLaps(times: number[]): CleanResult {
  if (times.length < 4) return { clean: times, out: [] };
  const [q1, , q3] = quartiles(times);
  const iqr = q3 - q1;
  const hi = q3 + 1.5 * iqr;
  const lo = q1 - 1.5 * iqr;
  const clean: number[] = [];
  const out: { lap: number; t: number }[] = [];
  times.forEach((t, i) => {
    if (t > hi || t < lo) out.push({ lap: i + 1, t });
    else clean.push(t);
  });
  return { clean, out };
}

/** Linear-regression slope of lap time over lap index (s/lap). */
export function degradation(times: number[]): number {
  if (times.length < 3) return 0;
  const n = times.length;
  const xs = times.map((_, i) => i + 1);
  const mx = mean(xs);
  const my = mean(times);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (times[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? num / den : 0;
}

/** Split a team's laps into stints at driver-change / pit laps. */
export function splitStints(laps: number[]): Stint[] {
  if (!laps.length) return [];
  const cl0 = cleanLaps(laps).clean;
  const racingMed = median(cl0.length ? cl0 : laps);
  const gridLap = laps.length > 3 && laps[0] < racingMed * 0.5;
  const startOff = gridLap ? 1 : 0;
  const work = gridLap ? laps.slice(1) : laps;
  const pitThreshold = racingMed * 1.35;
  const segs: { laps: number[]; start: number; end: number }[] = [];
  let cur: number[] = [];
  let curStart = 1 + startOff;
  work.forEach((t, i) => {
    if (t > pitThreshold && cur.length >= 3) {
      segs.push({ laps: cur, start: curStart, end: i + startOff });
      cur = [];
      curStart = i + 2 + startOff;
    } else {
      cur.push(t);
    }
  });
  if (cur.length) segs.push({ laps: cur, start: curStart, end: laps.length });
  return segs.map((s, i) => {
    const cl = cleanLaps(s.laps).clean;
    const racing = cl.length ? cl : s.laps;
    return {
      idx: i + 1,
      n: s.laps.length,
      start: s.start,
      end: s.end,
      best: Math.min(...s.laps),
      median: median(racing),
      mean: mean(racing),
      std: std(racing),
      cov: racing.length > 1 ? (std(racing) / mean(racing)) * 100 : 0,
      duration: s.laps.reduce((a, b) => a + b, 0),
      laps: s.laps,
    };
  });
}

/** Tag each stint Ace / Core / Backup against the field's Q1 / Q3 of medians. */
export function classifyStints(data: { stints: Stint[] }[]): void {
  const all: number[] = [];
  data.forEach((t) => t.stints.forEach((s) => all.push(s.median)));
  if (!all.length) return;
  const fast = quartiles(all)[0];
  const slow = quartiles(all)[2];
  data.forEach((t) =>
    t.stints.forEach((s) => {
      s.tier = s.median <= fast ? 'Ace' : s.median >= slow ? 'Backup' : 'Core';
    }),
  );
}

// ---- driver / kart tag lookups (pure, tag-parameterised) ----
function driverFor(tags: Tags | undefined, team: string, stintIdx: number): string {
  const t = tags?.drivers[team];
  return t && t[stintIdx] ? t[stintIdx] : `${team} · Seat ${stintIdx + 1}`;
}
function kartFor(tags: Tags | undefined, team: string, stintIdx: number): string | null {
  const t = tags?.karts[team];
  return t && t[stintIdx] ? t[stintIdx] : null;
}

/** stint_median ≈ grand + kartEffect + driverEffect (alternating mean-removal). */
export function estimateEffects(
  data: { name: string; stints: Stint[] }[],
  tags?: Tags,
): EffectsModel | null {
  const obs: { driver: string; kart: string; y: number }[] = [];
  data.forEach((t) =>
    t.stints.forEach((s, i) => {
      const drv = driverFor(tags, t.name, i);
      const krt = kartFor(tags, t.name, i);
      if (krt) obs.push({ driver: drv, kart: krt, y: s.median });
    }),
  );
  if (obs.length < 2) return null;
  const grand = mean(obs.map((o) => o.y));
  const drivers = [...new Set(obs.map((o) => o.driver))];
  const karts = [...new Set(obs.map((o) => o.kart))];
  const dEff: Record<string, number> = {};
  const kEff: Record<string, number> = {};
  drivers.forEach((d) => (dEff[d] = 0));
  karts.forEach((k) => (kEff[k] = 0));
  for (let iter = 0; iter < 200; iter++) {
    drivers.forEach((d) => {
      const r = obs.filter((o) => o.driver === d).map((o) => o.y - grand - kEff[o.kart]);
      dEff[d] = r.length ? mean(r) : 0;
    });
    karts.forEach((k) => {
      const r = obs.filter((o) => o.kart === k).map((o) => o.y - grand - dEff[o.driver]);
      kEff[k] = r.length ? mean(r) : 0;
    });
  }
  const kMean = mean(karts.map((k) => kEff[k]));
  karts.forEach((k) => (kEff[k] -= kMean));
  drivers.forEach((d) => (dEff[d] += kMean));
  let ssTot = 0;
  let ssRes = 0;
  obs.forEach((o) => {
    const pred = grand + kEff[o.kart] + dEff[o.driver];
    ssTot += (o.y - grand) ** 2;
    ssRes += (o.y - pred) ** 2;
  });
  return {
    grand,
    driverEffect: dEff,
    kartEffect: kEff,
    r2: ssTot ? 1 - ssRes / ssTot : 0,
    nObs: obs.length,
    crossover: drivers.length + karts.length <= obs.length,
  };
}

/** Roll every stint up by driver across the field, ranked on kart-adjusted pace. */
export function driverLeaderboard(
  data: { name: string; color: string; stints: Stint[] }[],
  tags?: Tags,
): DriverBoard {
  const eff = estimateEffects(data, tags);
  const drivers: Record<
    string,
    {
      name: string;
      team: string;
      color: string;
      stints: Stint[];
      allLaps: number[];
      karts: string[];
    }
  > = {};
  data.forEach((t) =>
    t.stints.forEach((s, i) => {
      const name = driverFor(tags, t.name, i);
      const d = (drivers[name] = drivers[name] || {
        name,
        team: t.name,
        color: t.color,
        stints: [],
        allLaps: [],
        karts: [],
      });
      d.stints.push(s);
      const krt = kartFor(tags, t.name, i);
      if (krt) d.karts.push(krt);
      const racing = cleanLaps(s.laps).clean;
      d.allLaps.push(...(racing.length ? racing : s.laps));
    }),
  );
  const rows: DriverRow[] = Object.values(drivers).map((d) => ({
    name: d.name,
    team: d.team,
    color: d.color,
    karts: [...new Set(d.karts)],
    stints: d.stints.length,
    laps: d.allLaps.length,
    best: Math.min(...d.allLaps),
    median: median(d.allLaps),
    mean: mean(d.allLaps),
    std: std(d.allLaps),
    cov: d.allLaps.length > 1 ? (std(d.allLaps) / mean(d.allLaps)) * 100 : 0,
    deg: degradation(d.allLaps),
    adj: eff && eff.driverEffect[d.name] != null ? eff.driverEffect[d.name] : null,
    rank: 0,
    tier: 'Core',
  }));
  const useAdjusted = !!eff && rows.every((r) => r.adj != null);
  const key = useAdjusted ? (r: DriverRow) => r.adj! : (r: DriverRow) => r.median;
  rows.sort((a, b) => key(a) - key(b));
  rows.forEach((r, i) => (r.rank = i + 1));
  const vals = rows.map(key);
  const fast = quartiles(vals)[0];
  const slow = quartiles(vals)[2];
  rows.forEach(
    (r) => (r.tier = (key(r) <= fast ? 'Ace' : key(r) >= slow ? 'Backup' : 'Core') as StintTier),
  );
  return { rows, effects: eff, useAdjusted };
}

/** Recovered hidden kart pace ratings, fastest first. */
export function kartLeaderboard(
  data: { name: string; stints: Stint[] }[],
  tags?: Tags,
): KartRow[] | null {
  const eff = estimateEffects(data, tags);
  if (!eff) return null;
  const use: Record<string, { stints: number; drivers: Set<string>; laps: number[] }> = {};
  data.forEach((t) =>
    t.stints.forEach((s, i) => {
      const k = kartFor(tags, t.name, i);
      if (!k) return;
      const u = (use[k] = use[k] || { stints: 0, drivers: new Set<string>(), laps: [] });
      u.stints++;
      u.drivers.add(driverFor(tags, t.name, i));
      const r = cleanLaps(s.laps).clean;
      u.laps.push(...(r.length ? r : s.laps));
    }),
  );
  const rows: KartRow[] = Object.keys(eff.kartEffect).map((k) => ({
    kart: k,
    effect: eff.kartEffect[k],
    stints: use[k] ? use[k].stints : 0,
    drivers: use[k] ? use[k].drivers.size : 0,
    rawMedian: use[k] && use[k].laps.length ? median(use[k].laps) : null,
    rank: 0,
  }));
  rows.sort((a, b) => a.effect - b.effect);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** Full race analysis: per-team stats, positions, gaps (optionally drop slowest N). */
export function analyse(karts: RawLaps, dropSlowest = 0): TeamAnalysis[] {
  const data: TeamAnalysis[] = Object.entries(karts).map(([name, laps], i) => {
    const stints = splitStints(laps);
    let vLaps = laps;
    let removed: number[] = [];
    if (dropSlowest > 0) {
      const sorted = laps.map((t, idx) => ({ t, idx })).sort((a, b) => b.t - a.t);
      removed = sorted.slice(0, Math.min(dropSlowest, laps.length)).map((x) => x.t);
      const removeIdx = new Set(sorted.slice(0, dropSlowest).map((x) => x.idx));
      vLaps = laps.filter((_, idx) => !removeIdx.has(idx));
    }
    const { clean, out } = cleanLaps(laps);
    const racingMedAll = median(clean.length ? clean : laps);
    const hasGridLap = laps.length > 3 && laps[0] < racingMedAll * 0.5;
    const racingLaps = hasGridLap ? laps.slice(1) : laps;
    const best = Math.min(...racingLaps);
    const cl = clean.length ? clean : laps;
    return {
      name,
      color: PAL[i % PAL.length],
      laps,
      n: hasGridLap ? laps.length - 1 : laps.length,
      hasGridLap,
      best,
      median: median(cl),
      mean: mean(cl),
      std: std(cl),
      cov: (std(cl) / mean(cl)) * 100,
      deg: degradation(cl),
      total: laps.reduce((x, y) => x + y, 0),
      vTotal: vLaps.reduce((x, y) => x + y, 0),
      vN: vLaps.length,
      removed,
      out,
      clean: cl,
      stints,
      pos: 0,
      lapsDown: 0,
      gap: '',
      gapBest: 0,
    };
  });
  classifyStints(data);
  const rankTotal = dropSlowest > 0 ? (d: TeamAnalysis) => d.vTotal : (d: TeamAnalysis) => d.total;
  const maxLaps = Math.max(...data.map((d) => (dropSlowest > 0 ? d.vN : d.n)));
  data.forEach((d) => (d.lapsDown = maxLaps - (dropSlowest > 0 ? d.vN : d.n)));
  data.sort((a, b) => a.lapsDown - b.lapsDown || rankTotal(a) - rankTotal(b));
  data.forEach((d, i) => (d.pos = i + 1));
  const leader = data[0];
  data.forEach(
    (d) =>
      (d.gap =
        d.lapsDown > 0
          ? `+${d.lapsDown} L`
          : d === leader
            ? '—'
            : '+' + (rankTotal(d) - rankTotal(leader)).toFixed(1) + 's'),
  );
  const fieldBest = Math.min(...data.map((d) => d.best));
  data.forEach((d) => (d.gapBest = d.best - fieldBest));
  return data;
}

/** Structured race insights (the view composes the narrative). */
export function buildInsights(d: TeamAnalysis[]): Insight[] {
  const ins: Insight[] = [];
  if (!d.length) return ins;
  const fastest = [...d].sort((a, b) => a.best - b.best)[0];
  const consistent = [...d].sort((a, b) => a.cov - b.cov)[0];
  const fader = [...d].sort((a, b) => b.deg - a.deg)[0];
  const improver = [...d].sort((a, b) => a.deg - b.deg)[0];
  const winner = [...d].sort((a, b) => a.pos - b.pos)[0];
  ins.push({ mark: 'Win', subject: winner.name, metric: winner.total });
  ins.push({ mark: 'Pace', subject: fastest.name, metric: fastest.best });
  ins.push({ mark: 'Consistency', subject: consistent.name, metric: consistent.cov });
  if (fader.deg > 0.04) ins.push({ mark: 'Fade', subject: fader.name, metric: fader.deg });
  if (improver.deg < -0.02)
    ins.push({ mark: 'Build', subject: improver.name, metric: improver.deg });
  if (fastest.name !== winner.name) ins.push({ mark: 'Gap', subject: fastest.name });
  const untapped = [...d].sort((a, b) => b.median - b.best - (a.median - a.best))[0];
  ins.push({ mark: 'Upside', subject: untapped.name, metric: untapped.median - untapped.best });
  const spread = [...d]
    .map((t) => {
      const meds = t.stints.map((s) => s.median);
      return { name: t.name, gap: Math.max(...meds) - Math.min(...meds) };
    })
    .sort((a, b) => b.gap - a.gap)[0];
  if (spread && spread.gap > 0.3)
    ins.push({ mark: 'Lineup', subject: spread.name, metric: spread.gap });
  return ins;
}

/** Structured lineup recommendations from a driver leaderboard. */
export function lineupRecos(board: DriverBoard): Reco[] {
  const { rows, effects, useAdjusted } = board;
  if (rows.length < 2)
    return [{ mark: 'Note', text: 'Tag at least two drivers for lineup recommendations.' }];
  const out: Reco[] = [];
  const paceLabel = useAdjusted ? 'kart-adjusted' : 'raw';
  const paceOf = (r: DriverRow) =>
    useAdjusted && effects ? effects.grand + (r.adj ?? 0) : r.median;
  const ace = rows[0];
  const weak = rows[rows.length - 1];
  out.push({
    mark: 'Start',
    text: `${ace.name} is your fastest seat (${paceLabel} pace ${paceOf(ace).toFixed(3)}s, CoV ${ace.cov.toFixed(2)}%). Open and close with them.`,
  });
  const cons = [...rows].sort((a, b) => a.cov - b.cov)[0];
  if (cons.name !== ace.name)
    out.push({
      mark: 'Anchor',
      text: `${cons.name} is the metronome (CoV ${cons.cov.toFixed(2)}%) — ideal for the long middle stint.`,
    });
  const gap = paceOf(weak) - paceOf(ace);
  if (gap > 0.4)
    out.push({
      mark: 'Watch',
      text: `${weak.name} is ${gap.toFixed(2)}s/lap off the ${paceLabel} pace — over a 23-lap stint that's ${(gap * 23).toFixed(1)}s. Shorten their stint or give them your best kart.`,
    });
  const fader = [...rows].sort((a, b) => b.deg - a.deg)[0];
  if (fader.deg > 0.04)
    out.push({
      mark: 'Stamina',
      text: `${fader.name} fades within a stint (+${fader.deg.toFixed(3)}s/lap) — keep their stints short.`,
    });
  if (useAdjusted && effects) {
    const unlucky = [...rows]
      .map((r) => ({ n: r.name, luck: r.median - (effects.grand + (r.adj ?? 0)) }))
      .sort((a, b) => b.luck - a.luck)[0];
    if (unlucky.luck > 0.25)
      out.push({
        mark: 'Kart luck',
        text: `${unlucky.n} was dealt slow karts (~${unlucky.luck.toFixed(2)}s/lap of their median was the kart, not them).`,
      });
  }
  return out;
}
