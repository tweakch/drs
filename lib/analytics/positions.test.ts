import { describe, expect, it } from 'vitest';
import { positionsByLap } from './positions';
import { analyse } from './engine';
import { raceToRawLaps } from './race-adapter';
import { REAL_RACE } from '@/lib/race/sample-race';

describe('positionsByLap', () => {
  it('ranks the faster team ahead at every lap', () => {
    const series = positionsByLap([
      { name: 'Fast', color: '#f00', laps: [10, 10, 10, 10] },
      { name: 'Slow', color: '#00f', laps: [12, 12, 12, 12] },
    ]);
    const fast = series.find((s) => s.name === 'Fast')!;
    const slow = series.find((s) => s.name === 'Slow')!;
    expect(fast.points.every((p) => p.pos === 1)).toBe(true);
    expect(slow.points.every((p) => p.pos === 2)).toBe(true);
  });

  it('captures an overtake as the cumulative time crosses over', () => {
    // B starts slow then rockets; by lap 3 B's cumulative time passes A.
    const series = positionsByLap([
      { name: 'A', color: '#f00', laps: [10, 10, 30] },
      { name: 'B', color: '#00f', laps: [12, 12, 12] },
    ]);
    const a = series.find((s) => s.name === 'A')!;
    const b = series.find((s) => s.name === 'B')!;
    expect(a.points[0].pos).toBe(1); // A ahead early
    expect(b.points[2].pos).toBe(1); // B ahead by lap 3
  });

  it('only lists the laps a team actually ran', () => {
    const series = positionsByLap([
      { name: 'Long', color: '#f00', laps: [10, 10, 10] },
      { name: 'Short', color: '#00f', laps: [10, 10] },
    ]);
    expect(series.find((s) => s.name === 'Short')!.points).toHaveLength(2);
    expect(series.find((s) => s.name === 'Long')!.points).toHaveLength(3);
  });

  it('runs on the sample race with a series per team', () => {
    const series = positionsByLap(analyse(raceToRawLaps(REAL_RACE)));
    expect(series).toHaveLength(REAL_RACE.teams.length);
    expect(series[0].points[0].pos).toBeGreaterThanOrEqual(1);
  });
});
