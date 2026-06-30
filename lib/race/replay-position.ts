// Pure, DOM-free replay positioning. Maps a kart's lap times + elapsed race time to
// the lap it is on and the fraction (0..1) it has completed of that lap. The replay
// loops forever, so elapsed time wraps around the kart's total race time.
//
// Ported from the prototype's teamPos (wohlen-race-analysis.html ~L1668): build a
// cumulative-time scan and interpolate linearly within the current lap by its time —
// a slow/pit lap visibly crawls because more wall-clock maps to less path progress.

/** Where a kart is at a given elapsed time: lap index + progress through it. */
export interface ReplayPosition {
  /** Zero-based index of the lap currently being driven. */
  lap: number;
  /** Progress through the current lap, 0..1, linear by the lap's time. */
  frac: number;
}

/**
 * Position of a kart at `elapsed` seconds of looping race time.
 *
 * @param lapTimes ordered lap durations in seconds (lap 0 = grid-crossing).
 * @param elapsed elapsed time in seconds; loops over the total race time.
 */
export function positionAt(lapTimes: number[], elapsed: number): ReplayPosition {
  const total = lapTimes.reduce((sum, lap) => sum + lap, 0);
  if (lapTimes.length === 0 || total <= 0) return { lap: 0, frac: 0 };

  // Loop elapsed time over the full race (handle negatives defensively).
  let t = elapsed % total;
  if (t < 0) t += total;

  // Walk laps until the remainder falls inside the current lap.
  let lap = 0;
  while (lap < lapTimes.length && t >= lapTimes[lap]) {
    t -= lapTimes[lap];
    lap++;
  }

  // Exactly at the wrap point: park on the final lap, fully complete.
  if (lap >= lapTimes.length) return { lap: lapTimes.length - 1, frac: 1 };

  const dur = lapTimes[lap];
  const frac = dur > 0 ? t / dur : 0;
  return { lap, frac };
}
