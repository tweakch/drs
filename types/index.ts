// Domain types — mirror of prompts/shared/entities.md. No derivations here.

export type RaceFormat = 'endurance';
export type StintTier = 'Ace' | 'Core' | 'Backup';

export interface Track {
  name: string;
  lengthM: number;
  /** SVG path + apexes for the Replay view (shape TBD in a later slice). */
  layout?: unknown;
}

export interface Lap {
  /** 1-based position in the team's sequence. */
  index: number;
  timeS: number;
  isGrid?: boolean;
  isPit?: boolean;
  isOut?: boolean;
  isFast?: boolean;
  isInc?: boolean;
}

/** A contiguous run between pit stops — conceptually a (driver × kart) tuple. */
export interface Stint {
  idx: number;
  start: number;
  end: number;
  laps: Lap[];
  driver?: string;
  kart?: string;
  best: number;
  median: number;
  mean: number;
  std: number;
  cov: number;
  duration: number;
  tier?: StintTier;
}

export interface Team {
  id: string;
  raceId: string;
  name: string;
  color: string;
  laps: Lap[];
  /** Derived from the lap sequence — not stored. */
  stints?: Stint[];
}

export interface Driver {
  name: string;
  team: string;
  stints: Stint[];
  best: number;
  median: number;
  cov: number;
  deg: number;
  /** Kart-adjusted pace: expected lap in an average kart. */
  adj?: number | null;
  tier?: StintTier;
}

export interface Kart {
  number: string;
  /** Pace effect vs field mean (negative = faster), centred at 0. */
  effect: number;
  stints: number;
  drivers: number;
  rawMedian?: number | null;
}

export interface Race {
  id: string;
  name: string;
  track: Track;
  /** ISO date, e.g. "2026-06-28". */
  date: string;
  format: RaceFormat;
  durationS: number;
  teams: Team[];
  /** True when derived via what-if edits. */
  isVirtual?: boolean;
}
