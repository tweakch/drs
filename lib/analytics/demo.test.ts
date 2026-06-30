import { describe, expect, it } from 'vitest';
import { generateDemoRace, mulberry32 } from './demo';
import { analyse } from './engine';

describe('generateDemoRace', () => {
  it('produces the requested number of teams with the requested lap count', () => {
    const race = generateDemoRace(5, { laps: 30, rng: mulberry32(1) });
    expect(Object.keys(race)).toHaveLength(5);
    for (const laps of Object.values(race)) expect(laps).toHaveLength(30);
  });

  it('is deterministic for a fixed seed', () => {
    expect(generateDemoRace(4, { laps: 20, rng: mulberry32(42) })).toEqual(
      generateDemoRace(4, { laps: 20, rng: mulberry32(42) }),
    );
  });

  it('yields a race the engine can analyse end to end', () => {
    const race = generateDemoRace(6, { laps: 36, rng: mulberry32(7) });
    const data = analyse(race);
    expect(data).toHaveLength(6);
    expect(data[0].pos).toBe(1);
    // Every team should split into ≥ 2 stints given periodic pit laps.
    expect(data.every((d) => d.stints.length >= 2)).toBe(true);
  });

  it('clamps team count to the available range', () => {
    expect(
      Object.keys(generateDemoRace(99, { laps: 12, rng: mulberry32(3) })).length,
    ).toBeLessThanOrEqual(12);
    expect(Object.keys(generateDemoRace(1, { laps: 12, rng: mulberry32(3) })).length).toBe(2);
  });
});
