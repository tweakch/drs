import type { Race } from './sample-race';
import { REAL_RACE } from './sample-race';

// Seam for the landing-page replay's data source.
//
// Today this returns the embedded official Wohlen race (public sample data) so the
// landing page stays static and DB-free. Later this becomes the swap point: query
// the latest persisted race from the DB and return it here — the public page and
// the LandingReplay component keep consuming the same Race shape, so neither changes.
export function getLatestRace(): Race {
  return REAL_RACE;
}
