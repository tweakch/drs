import { describe, expect, it } from 'vitest';
import { positionAt } from './replay-position';

describe('positionAt', () => {
  it('starts at lap 0, frac 0 when t = 0', () => {
    expect(positionAt([10, 20, 30], 0)).toEqual({ lap: 0, frac: 0 });
  });

  it('interpolates linearly within the first lap', () => {
    expect(positionAt([10, 20, 30], 5)).toEqual({ lap: 0, frac: 0.5 });
  });

  it('advances to a later lap and interpolates within it', () => {
    // 10 (lap 0) consumed, 5 of 20 into lap 1 → frac 0.25.
    expect(positionAt([10, 20, 30], 15)).toEqual({ lap: 1, frac: 0.25 });
  });

  it('wraps past the total race time (loops)', () => {
    // total = 60; t = 65 → 5 → same as t = 5.
    expect(positionAt([10, 20, 30], 65)).toEqual({ lap: 0, frac: 0.5 });
  });

  it('parks on the final lap at the exact wrap point', () => {
    expect(positionAt([10, 20, 30], 60)).toEqual({ lap: 0, frac: 0 });
    // One epsilon before the wrap is deep in the last lap.
    const pos = positionAt([10, 20, 30], 59.999);
    expect(pos.lap).toBe(2);
    expect(pos.frac).toBeGreaterThan(0.99);
  });

  it('handles negative elapsed by looping backwards', () => {
    expect(positionAt([10, 20, 30], -55)).toEqual({ lap: 0, frac: 0.5 });
  });

  it('returns the origin for empty or zero-length races', () => {
    expect(positionAt([], 42)).toEqual({ lap: 0, frac: 0 });
    expect(positionAt([0, 0], 42)).toEqual({ lap: 0, frac: 0 });
  });

  it('skips zero-duration laps (e.g. a 0.000 grid lap)', () => {
    // lap 0 is 0s, so any t lands from lap 1 onward.
    expect(positionAt([0, 50], 25)).toEqual({ lap: 1, frac: 0.5 });
  });
});
