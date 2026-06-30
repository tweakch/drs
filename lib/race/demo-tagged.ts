// A deterministic synthetic race WITH driver/kart rotation, so the kart-effects
// decomposition (Driver / Kart views) is identifiable. The sample Wohlen race has
// one kart per team (no crossover); this gives the analysis something to separate.

import { generateDemoRace, mulberry32 } from '@/lib/analytics/demo';
import type { RawLaps, Tags } from '@/lib/analytics/types';

const TEAMS = ['Kolben', 'DRS', 'NosBros', 'VollGas', 'BambiRacing', 'DriftHappens'];
// Each team's seat names, cycled across its stints.
const SEATS: Record<string, string[]> = {
  Kolben: ['Kovač', 'Keller'],
  DRS: ['Demir', 'Roth'],
  NosBros: ['Nguyen', 'Nobel'],
  VollGas: ['Vogt', 'Vance'],
  BambiRacing: ['Bianchi', 'Brun'],
  DriftHappens: ['Diaz', 'Dahl'],
};
// Shared kart pool that rotates through the teams (creates driver×kart crossover).
const KART_POOL = ['51', '52', '53', '54', '55', '56'];
const MAX_STINTS = 8;

/** A 4-team scenario with 3 spare box karts, for the Detektiv constraint solver.
 * Teams start on karts 51–54; karts 55–57 wait in the box and rotate in at stops. */
export function detektivScenario(): {
  raw: RawLaps;
  teamNos: Record<string, string>;
  boxStart: string[];
} {
  const base = generateDemoRace(4, { laps: 48, rng: mulberry32(99) });
  const names = Object.keys(base);
  const teamNos: Record<string, string> = {};
  names.forEach((name, i) => (teamNos[name] = String(51 + i)));
  return { raw: base, teamNos, boxStart: ['55', '56', '57'] };
}

/** Synthetic race + per-stint driver/kart tags with rotation. Seeded → stable. */
export function taggedDemoRace(): { raw: RawLaps; tags: Tags } {
  const base = generateDemoRace(TEAMS.length, { laps: 60, rng: mulberry32(2026) });
  const raw: RawLaps = {};
  const drivers: Record<string, string[]> = {};
  const karts: Record<string, string[]> = {};
  Object.values(base).forEach((laps, t) => {
    const name = TEAMS[t];
    raw[name] = laps;
    const seats = SEATS[name];
    drivers[name] = Array.from({ length: MAX_STINTS }, (_, s) => seats[s % seats.length]);
    // Latin-square-style rotation so every kart is driven by several drivers.
    karts[name] = Array.from(
      { length: MAX_STINTS },
      (_, s) => KART_POOL[(t + s) % KART_POOL.length],
    );
  });
  return { raw, tags: { drivers, karts } };
}
