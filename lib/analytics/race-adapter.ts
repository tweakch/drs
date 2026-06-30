// Bridges the stored Race shape (lib/race/sample-race) to the engine's RawLaps.
// Keeps the engine itself free of any race-source coupling.

import type { Race } from '@/lib/race/sample-race';
import type { RawLaps } from './types';

/** team name → ordered lap times, the engine's input shape. */
export function raceToRawLaps(race: Race): RawLaps {
  const raw: RawLaps = {};
  for (const team of race.teams) raw[team.name] = team.laps;
  return raw;
}

/** A stable name→kart-number lookup for labelling (one kart per team in samples). */
export function kartNumbers(race: Race): Record<string, number> {
  const map: Record<string, number> = {};
  for (const team of race.teams) map[team.name] = team.kart;
  return map;
}
