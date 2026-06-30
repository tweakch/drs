// Pure, DOM-free race classification for the replay. Given every kart's lap times
// and the looping elapsed race time, rank the field the way an F1 timing tower does:
// whoever has covered the most race distance leads, and gaps are that distance
// difference converted to seconds via the leader's pace.
//
// Built on positionAt so the tower and the on-track markers stay in lock-step: both
// read the same {lap, frac} for a kart at a given elapsed time.

import { positionAt } from './replay-position';
import type { Team } from './sample-race';

/** One row of the live timing tower at a given instant. */
export interface Standing {
  /** 1-based finishing order at this instant (1 = leader). */
  position: number;
  /** Kart number painted on the chassis (matches the on-track marker). */
  kart: number;
  /** Team name from the timing printout. */
  name: string;
  /** Original index in the race's team list — drives the marker-matching colour. */
  colorIndex: number;
  /** 1-based lap the kart is currently on. */
  lap: number;
  /** Total laps this kart runs across the race. */
  totalLaps: number;
  /** Approx. seconds behind the leader (0 for the leader). */
  gapToLeaderSec: number;
  /** Approx. seconds behind the car directly ahead (0 for the leader). */
  intervalSec: number;
  /** Fractional laps behind the leader (≥ 1 means lapped). */
  lapsToLeader: number;
  /** True when the car directly ahead is at least a full lap up. */
  lapped: boolean;
}

// Fallback per-lap seconds if the leader's current lap can't be read (degenerate data).
const FALLBACK_PACE = 52;

/**
 * Classify the field at `elapsed` seconds of looping race time.
 *
 * Distance covered = completed laps + fraction of the current lap; the field is
 * ranked on it, descending. Time gaps are `lapsBehind × leaderPace`, an honest
 * approximation (no per-position time history is reconstructed).
 *
 * @returns one {@link Standing} per team, already sorted leader-first.
 */
export function standingsAt(teams: Team[], elapsed: number): Standing[] {
  const rows = teams.map((team, i) => {
    const { lap, frac } = positionAt(team.laps, elapsed);
    const lapTime = team.laps[lap] ?? team.laps[team.laps.length - 1] ?? 0;
    return { team, colorIndex: i, lap, distance: lap + frac, lapTime };
  });

  // More distance covered in the same elapsed time = further ahead.
  rows.sort((a, b) => b.distance - a.distance);

  const leader = rows[0];
  if (!leader) return [];
  const pace = leader.lapTime || FALLBACK_PACE;

  return rows.map((r, idx) => {
    const ahead = rows[idx - 1];
    const lapsToLeader = leader.distance - r.distance;
    const lapsToAhead = ahead ? ahead.distance - r.distance : 0;
    return {
      position: idx + 1,
      kart: r.team.kart,
      name: r.team.name,
      colorIndex: r.colorIndex,
      lap: r.lap + 1,
      totalLaps: r.team.laps.length,
      gapToLeaderSec: lapsToLeader * pace,
      intervalSec: lapsToAhead * pace,
      lapsToLeader,
      lapped: lapsToAhead >= 1,
    };
  });
}
