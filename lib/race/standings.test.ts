import { describe, expect, it } from 'vitest';
import { standingsAt } from './standings';
import type { Team } from './sample-race';

const team = (kart: number, laps: number[]): Team => ({ name: `K${kart}`, kart, laps });

describe('standingsAt', () => {
  it('ranks the kart that has covered the most distance first', () => {
    // At t=30: fast kart (10s laps) is on lap 3; slow kart (20s laps) is on lap 1.
    const fast = team(1, [10, 10, 10, 10, 10, 10]);
    const slow = team(2, [20, 20, 20, 20, 20, 20]);
    const rows = standingsAt([slow, fast], 30);

    expect(rows.map((r) => r.kart)).toEqual([1, 2]);
    expect(rows[0].position).toBe(1);
    expect(rows[1].position).toBe(2);
  });

  it('gives the leader a zero gap and trails everyone else by a positive gap', () => {
    const fast = team(1, [10, 10, 10, 10, 10, 10]);
    const slow = team(2, [20, 20, 20, 20, 20, 20]);
    const [leader, second] = standingsAt([fast, slow], 30);

    expect(leader.gapToLeaderSec).toBe(0);
    expect(leader.intervalSec).toBe(0);
    expect(second.gapToLeaderSec).toBeGreaterThan(0);
    expect(second.intervalSec).toBeGreaterThan(0);
  });

  it('preserves each team colour index regardless of running order', () => {
    const fast = team(1, [10, 10, 10, 10]);
    const slow = team(2, [20, 20, 20, 20]);
    // slow is passed first (index 0) but runs second — its colour index stays 0.
    const rows = standingsAt([slow, fast], 25);
    const slowRow = rows.find((r) => r.kart === 2);
    expect(slowRow?.colorIndex).toBe(0);
  });

  it('reports the current 1-based lap and total laps', () => {
    const t = team(1, [10, 10, 10, 10, 10]); // 5 laps total
    const [row] = standingsAt([t], 25); // 25s → lap index 2 → lap 3
    expect(row.lap).toBe(3);
    expect(row.totalLaps).toBe(5);
  });

  it('flags a kart that is a full lap or more down as lapped', () => {
    const fast = team(1, [10, 10, 10, 10, 10, 10, 10, 10]); // lap 4 at t=40
    const slow = team(2, [20, 20, 20, 20, 20, 20, 20, 20]); // lap 2 at t=40
    const rows = standingsAt([fast, slow], 40);
    const slowRow = rows.find((r) => r.kart === 2);
    expect(slowRow?.lapsToLeader).toBeGreaterThanOrEqual(1);
    expect(slowRow?.lapped).toBe(true);
  });

  it('returns an empty tower for an empty field', () => {
    expect(standingsAt([], 10)).toEqual([]);
  });
});
