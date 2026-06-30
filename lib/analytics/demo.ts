// Lightweight synthetic-race generator for the Data view's "Demo" button. Produces
// plausible RawLaps (team base pace + noise + periodic pit laps + a short grid lap)
// so the engine has something to chew on. Not the full Director simulator.

import type { RawLaps } from './types';

const NAMES = [
  'Kolben',
  'DRS',
  'NosBros',
  'VollGas',
  'BambiRacing',
  'DriftHappens',
  'UnsafeBros',
  'LeftBrakers',
  'IchnusaBoys',
  'NPCracing',
  'PistonCup',
  'bitshift',
];

export interface DemoOptions {
  /** Laps per team (incl. the grid lap). */
  laps?: number;
  /** Injectable RNG for deterministic tests; defaults to Math.random. */
  rng?: () => number;
}

// Box–Muller normal sample from a [0,1) uniform source.
function gaussian(rng: () => number, mean: number, sd: number): number {
  const u = 1 - rng();
  const v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Generate a synthetic race of `nTeams` teams. */
export function generateDemoRace(nTeams = 6, opts: DemoOptions = {}): RawLaps {
  const rng = opts.rng ?? Math.random;
  const lapsPer = Math.max(8, opts.laps ?? 36);
  const n = Math.max(2, Math.min(nTeams, NAMES.length));
  const raw: RawLaps = {};
  for (let i = 0; i < n; i++) {
    const base = 50 + gaussian(rng, 0, 1.2); // team pace
    const drift = 0.008 + Math.abs(gaussian(rng, 0, 0.01)); // mild degradation
    const laps: number[] = [Number(Math.max(1.5, gaussian(rng, 3, 0.4)).toFixed(3))]; // short grid lap
    for (let l = 1; l < lapsPer; l++) {
      if (l % 12 === 0) {
        laps.push(Number((80 + gaussian(rng, 0, 1)).toFixed(3))); // driver-change / pit lap
      } else {
        laps.push(Number((base + gaussian(rng, 0, 0.35) + l * drift).toFixed(3)));
      }
    }
    raw[NAMES[i]] = laps;
  }
  return raw;
}

/** Small seeded RNG (mulberry32) — handy for reproducible demos/tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
