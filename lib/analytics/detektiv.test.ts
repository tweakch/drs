import { describe, expect, it } from 'vitest';
import { analyse } from './engine';
import { derivePitEvents, detektivKey, kartPool, solveKarts } from './detektiv';
import { detektivScenario } from '@/lib/race/demo-tagged';

describe('detektiv solver', () => {
  const { raw, teamNos, boxStart } = detektivScenario();
  const data = analyse(raw);
  const input = { teamNos, boxStart };

  it('derives one pit event per stint boundary, time-ordered', () => {
    const events = derivePitEvents(data);
    const expected = data.reduce((n, d) => n + (d.stints.length - 1), 0);
    expect(events.length).toBe(expected);
    for (let i = 1; i < events.length; i++)
      expect(events[i].t).toBeGreaterThanOrEqual(events[i - 1].t);
  });

  it('builds a pool of team grid karts plus box karts', () => {
    const pool = kartPool(data, input);
    expect(pool.boxSize).toBe(3);
    expect(pool.boxCandidates).toEqual(['55', '56', '57']);
    expect(pool.all).toEqual(expect.arrayContaining(['51', '52', '53', '54', '55', '56', '57']));
  });

  it('resolves the grid stint and reports a coherent confidence', () => {
    const sol = solveKarts(data, input);
    // Stint 0 is always known (the grid kart) → singleton == teamNos[team].
    for (const t of data) {
      expect(sol.cand[detektivKey(t.name, 0)]).toEqual([teamNos[t.name]]);
    }
    expect(sol.total).toBe(data.reduce((n, d) => n + d.stints.length, 0));
    expect(sol.resolved).toBeGreaterThanOrEqual(data.length); // ≥ the grid stints
    expect(sol.resolved).toBeLessThanOrEqual(sol.total);
    expect(sol.confidence).toBeCloseTo(sol.resolved / sol.total, 9);
  });

  it('pinning a fact narrows that stint to the chosen kart', () => {
    const team = data[0].name;
    const sol = solveKarts(data, { ...input, facts: { [detektivKey(team, 1)]: '55' } });
    expect(sol.cand[detektivKey(team, 1)]).toEqual(['55']);
  });
});
