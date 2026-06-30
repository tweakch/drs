// Kart Detective — infers which physical kart each team drove in each stint, given
// only the grid karts and the pit-stop timing. Ported from the prototype's
// solveKartsEngine; the prototype's globals (kartTags / detective.facts / _truth)
// are parameters here. Pure and DOM-free.

import type { TeamAnalysis } from './types';

export interface DetektivInput {
  /** team name → its grid (stint-0) kart number. */
  teamNos: Record<string, string>;
  /** Known box karts (e.g. demo ground truth) — the karts resting in the pit. */
  boxStart?: string[];
  /** User-pinned facts: key `team#stint` → kart number. */
  facts?: Record<string, string>;
}

export interface PitEvent {
  team: string;
  stintIdx: number;
  t: number;
}

export interface DetektivSolution {
  /** key `team#stint` → candidate kart numbers (singleton = resolved). */
  cand: Record<string, string[]>;
  events: PitEvent[];
  karts: string[];
  boxSize: number;
  resolved: number;
  total: number;
  confidence: number;
  stintCount: Record<string, number>;
  teamNos: string[];
  boxCandidates: string[];
}

export const detektivKey = (team: string, stint: number): string => `${team}#${stint}`;

type Data = Pick<TeamAnalysis, 'name' | 'laps' | 'hasGridLap' | 'stints'>[];

/** Time-ordered pit swaps: cumulative time each team enters the box per stint. */
export function derivePitEvents(data: Data): PitEvent[] {
  const events: PitEvent[] = [];
  data.forEach((t) => {
    let cum = 0;
    const laps = t.laps;
    let lapPtr = t.hasGridLap ? 1 : 0;
    t.stints.forEach((s, si) => {
      for (let l = 0; l < s.n; l++) {
        cum += laps[lapPtr] || 0;
        lapPtr++;
      }
      if (si < t.stints.length - 1) {
        events.push({ team: t.name, stintIdx: si + 1, t: +cum.toFixed(1) });
        const pitLap = laps[lapPtr] || 0;
        cum += pitLap;
        lapPtr++;
      }
    });
  });
  events.sort((a, b) => a.t - b.t);
  return events;
}

/** Pool of physical kart ids: each team's grid kart + the box karts. */
export function kartPool(data: Data, input: DetektivInput) {
  const teamNos = data.map((t) => input.teamNos[t.name] ?? t.name);
  let extra: string[];
  if (input.boxStart?.length) {
    extra = input.boxStart.map(String);
  } else {
    const have = new Set(teamNos.map(Number).filter((n) => !isNaN(n)));
    const lo = Math.min(...have);
    const hi = Math.max(...have);
    const missing: string[] = [];
    for (let k = lo; k <= hi; k++) if (!have.has(k)) missing.push(String(k));
    extra = missing.length >= 3 ? missing : ['B1', 'B2', 'B3'];
  }
  return { teamNos, all: [...teamNos, ...extra], boxSize: 3, boxCandidates: extra };
}

/** Candidate kart sets per (team, stint), tightened to a fixpoint by constraints. */
export function solveKarts(data: Data, input: DetektivInput): DetektivSolution {
  const facts = input.facts ?? {};
  const teams = data.map((t) => t.name);
  const events = derivePitEvents(data);
  const pool = kartPool(data, input);
  const karts = pool.all;
  const boxSize = pool.boxSize;
  const stintCount: Record<string, number> = {};
  data.forEach((t) => (stintCount[t.name] = t.stints.length));

  const cand: Record<string, Set<string>> = {};
  data.forEach((t) => {
    const grid = input.teamNos[t.name] ?? t.name;
    for (let st = 0; st < stintCount[t.name]; st++) {
      const f = facts[detektivKey(t.name, st)];
      if (st === 0) cand[detektivKey(t.name, st)] = new Set([grid]);
      else if (f) cand[detektivKey(t.name, st)] = new Set([f]);
      else cand[detektivKey(t.name, st)] = new Set(karts);
    }
  });

  const evs = [...events].sort((a, b) => a.t - b.t);
  const activeStintAt = (tm: string, t: number) => {
    let st = 0;
    for (const e of evs) if (e.team === tm && e.t <= t) st = e.stintIdx;
    return st;
  };
  const trackCandAt = (tm: string, t: number) =>
    cand[detektivKey(tm, activeStintAt(tm, t))] || new Set(karts);

  let changed = true;
  let iters = 0;
  while (changed && iters < 300) {
    changed = false;
    iters++;

    // forward box-set propagation
    const onTrack0: Record<string, string> = {};
    let gridKnown = true;
    teams.forEach((tm) => {
      const s = cand[detektivKey(tm, 0)];
      if (s && s.size === 1) onTrack0[tm] = [...s][0];
      else gridKnown = false;
    });
    const boxSet = new Set(karts);
    Object.values(onTrack0).forEach((k) => boxSet.delete(k));
    const onTrackNow: Record<string, string | null> = { ...onTrack0 };
    let boxExact = gridKnown && boxSet.size === boxSize;
    for (const ev of evs) {
      const k = detektivKey(ev.team, ev.stintIdx);
      const cs = cand[k];
      if (!cs) continue;
      if (boxExact) {
        const inter: string[] = [];
        cs.forEach((x) => {
          if (boxSet.has(x)) inter.push(x);
        });
        if (inter.length && inter.length < cs.size) {
          cs.clear();
          inter.forEach((x) => cs.add(x));
          changed = true;
        }
        if (boxSet.size === boxSize && cs.size > 1) {
          const excl = new Set<string>();
          const prev = cand[detektivKey(ev.team, ev.stintIdx - 1)];
          if (prev && prev.size === 1) excl.add([...prev][0]);
          const TOL = 8;
          teams.forEach((tm2) => {
            if (tm2 === ev.team) return;
            const s2 = onTrackNow[tm2];
            if (s2 == null) return;
            const near = evs.some((e2) => e2.team === tm2 && Math.abs(e2.t - ev.t) <= TOL);
            if (!near) excl.add(s2);
          });
          const poss = [...boxSet].filter((x) => !excl.has(x) && cs.has(x));
          if (poss.length && poss.length < cs.size) {
            cs.clear();
            poss.forEach((x) => cs.add(x));
            changed = true;
          }
        }
      }
      const returned = onTrackNow[ev.team];
      const taken = cs.size === 1 ? [...cs][0] : null;
      if (taken) {
        boxSet.delete(taken);
        if (returned != null) boxSet.add(returned);
        onTrackNow[ev.team] = taken;
      } else {
        if (returned != null) boxSet.add(returned);
        onTrackNow[ev.team] = null;
        boxExact = false;
      }
    }

    // pairwise on-track exclusion at each pit instant
    const TOL = 8;
    for (const ev of evs) {
      const k = detektivKey(ev.team, ev.stintIdx);
      const cs = cand[k];
      if (!cs) continue;
      const before = ev.t - 0.001;
      const elsewhere = new Set<string>();
      teams.forEach((tm2) => {
        if (tm2 === ev.team) return;
        if (evs.some((e2) => e2.team === tm2 && Math.abs(e2.t - ev.t) <= TOL)) return;
        const c2 = trackCandAt(tm2, before);
        if (c2.size === 1) elsewhere.add([...c2][0]);
      });
      const leaving = cand[detektivKey(ev.team, ev.stintIdx - 1)];
      const own = leaving && leaving.size === 1 ? [...leaving][0] : null;
      const rm: string[] = [];
      cs.forEach((x) => {
        if (elsewhere.has(x)) rm.push(x);
        else if (own && x === own) rm.push(x);
      });
      if (rm.length) {
        rm.forEach((x) => cs.delete(x));
        changed = true;
      }
    }

    // time-overlap uniqueness: a singleton kart can't span two overlapping stints
    const intervals: { team: string; t0: number; t1: number; set: Set<string> }[] = [];
    teams.forEach((tm) => {
      const pits = evs.filter((e) => e.team === tm).sort((a, b) => a.stintIdx - b.stintIdx);
      let t0 = 0;
      for (let st = 0; st < stintCount[tm]; st++) {
        const np = pits.find((p) => p.stintIdx === st + 1);
        const t1 = np ? np.t : Infinity;
        intervals.push({ team: tm, t0, t1, set: cand[detektivKey(tm, st)] });
        t0 = t1;
      }
    });
    for (const a of intervals) {
      if (!a.set || a.set.size !== 1) continue;
      const kk = [...a.set][0];
      for (const b of intervals) {
        if (b === a || b.team === a.team || !b.set) continue;
        if (a.t0 < b.t1 && b.t0 < a.t1 && b.set.has(kk)) {
          b.set.delete(kk);
          changed = true;
        }
      }
    }
  }

  let resolved = 0;
  let total = 0;
  const candOut: Record<string, string[]> = {};
  teams.forEach((tm) => {
    for (let st = 0; st < stintCount[tm]; st++) {
      total++;
      const set = cand[detektivKey(tm, st)];
      if (set.size === 1) resolved++;
      candOut[detektivKey(tm, st)] = [...set];
    }
  });
  return {
    cand: candOut,
    events: evs,
    karts,
    boxSize,
    resolved,
    total,
    confidence: total ? resolved / total : 0,
    stintCount,
    teamNos: pool.teamNos,
    boxCandidates: pool.boxCandidates,
  };
}
