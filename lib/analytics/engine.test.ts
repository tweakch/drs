import { describe, expect, it } from 'vitest';
import golden from './__fixtures__/wohlen-golden.json';
import {
  analyse,
  buildInsights,
  cleanLaps,
  classifyStints,
  degradation,
  estimateEffects,
  parseInput,
  quartiles,
  splitStints,
} from './engine';
import { raceToRawLaps } from './race-adapter';
import type { Stint } from './types';
import { REAL_RACE } from '@/lib/race/sample-race';

// Tolerance for float parity with the prototype's own arithmetic.
const EPS = 1e-9;

describe('engine — golden master vs prototype (sample Wohlen race)', () => {
  const data = analyse(raceToRawLaps(REAL_RACE), 0);

  it('produces the same team count and finishing order', () => {
    expect(data.length).toBe(golden.teamCount);
    expect(data.map((d) => d.name)).toEqual(golden.teams.map((t) => t.name));
  });

  it('reproduces per-team stats, positions and gaps exactly', () => {
    data.forEach((d, i) => {
      const g = golden.teams[i];
      expect(d.pos).toBe(g.pos);
      expect(d.n).toBe(g.n);
      expect(d.hasGridLap).toBe(g.hasGridLap);
      expect(d.lapsDown).toBe(g.lapsDown);
      expect(d.gap).toBe(g.gap);
      expect(d.color).toBe(g.color);
      expect(d.stints.length).toBe(g.stintCount);
      for (const k of [
        'best',
        'median',
        'mean',
        'std',
        'cov',
        'deg',
        'total',
        'gapBest',
      ] as const) {
        expect(Math.abs(d[k] - g[k])).toBeLessThan(EPS);
      }
    });
  });

  it('reproduces stint splits, stats and tiers exactly', () => {
    data.forEach((d, i) => {
      d.stints.forEach((s, j) => {
        const g = golden.teams[i].stints[j];
        expect(s.idx).toBe(g.idx);
        expect(s.n).toBe(g.n);
        expect(s.start).toBe(g.start);
        expect(s.end).toBe(g.end);
        expect(s.tier).toBe(g.tier);
        for (const k of ['best', 'median', 'std', 'cov', 'duration'] as const) {
          expect(Math.abs(s[k] - g[k])).toBeLessThan(EPS);
        }
      });
    });
  });

  it('reproduces the insight set (marks + subjects + metrics)', () => {
    const got = buildInsights(data);
    expect(got.map((i) => i.mark)).toEqual(golden.insights.map((g) => g[0]));
    got.forEach((ins, i) => {
      const [, payload] = golden.insights[i];
      const [subject, metric] = payload.split('|');
      expect(ins.subject).toBe(subject);
      if (metric !== undefined) {
        // Golden stores metric pre-rounded (toFixed) — match at that precision.
        const dp = metric.split('.')[1]?.length ?? 0;
        expect(ins.metric!.toFixed(dp)).toBe(metric);
      }
    });
  });
});

describe('engine — unit behaviours', () => {
  it('parses freeform "Name: t, t" and CSV input', () => {
    expect(parseInput('STM: 53.4, 54.1, 1:02.8')).toEqual({ STM: [53.4, 54.1, 62.8] });
    const csv = 'Kart,Lap,Time\n54,1,53.4\n54,2,52.1\n55,1,51.9';
    expect(parseInput(csv)).toEqual({ '54': [53.4, 52.1], '55': [51.9] });
  });

  it('cleanLaps removes slow-side IQR outliers', () => {
    const { clean, out } = cleanLaps([50, 50.2, 50.1, 50.3, 80]);
    expect(out.map((o) => o.t)).toContain(80);
    expect(clean).not.toContain(80);
  });

  it('degradation is the per-lap slope (positive = slowing)', () => {
    expect(degradation([50, 51, 52, 53])).toBeCloseTo(1, 9);
    expect(degradation([53, 52, 51, 50])).toBeCloseTo(-1, 9);
  });

  it('splitStints drops a short grid lap and breaks at pit laps', () => {
    // grid 2s, then two ~50s stints separated by an 80s pit lap.
    const laps = [2, 50, 50, 50, 50, 80, 51, 51, 51, 51];
    const stints = splitStints(laps);
    expect(stints.length).toBe(2);
    expect(stints[0].start).toBe(2); // grid lap offset
  });

  it('estimateEffects centres kart effects at zero and separates kart from driver', () => {
    // Balanced 2×2 additive design: kart X is 1s faster than kart Y.
    const data = [
      { name: 'A', stints: [stub(50), stub(52)] },
      { name: 'B', stints: [stub(51), stub(53)] },
    ];
    const tags = {
      drivers: { A: ['DA', 'DA'], B: ['DB', 'DB'] },
      karts: { A: ['X', 'Y'], B: ['X', 'Y'] },
    };
    const eff = estimateEffects(data, tags)!;
    expect(eff).not.toBeNull();
    const kMean = (eff.kartEffect.X + eff.kartEffect.Y) / 2;
    expect(Math.abs(kMean)).toBeLessThan(1e-6);
    expect(eff.kartEffect.X).toBeLessThan(eff.kartEffect.Y); // X faster
    expect(eff.r2).toBeGreaterThan(0.99);
  });

  it('classifyStints labels by field quartiles', () => {
    const data = [{ stints: [stub(50), stub(52), stub(54), stub(56)] }];
    classifyStints(data);
    expect(data[0].stints[0].tier).toBe('Ace');
    expect(data[0].stints[3].tier).toBe('Backup');
  });
});

// Minimal stint stub with a fixed median for effects/classify tests.
function stub(m: number): Stint {
  return {
    idx: 1,
    n: 1,
    start: 1,
    end: 1,
    best: m,
    median: m,
    mean: m,
    std: 0,
    cov: 0,
    duration: m,
    laps: [m],
  };
}

it('quartiles interpolate linearly', () => {
  expect(quartiles([1, 2, 3, 4, 5])).toEqual([2, 3, 4]);
});
