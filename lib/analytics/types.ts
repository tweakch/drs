// Engine-facing types for the analytics module. Pure data; no DOM/React.

/** Parsed lap input: kart/team name → ordered lap times in seconds. */
export type RawLaps = Record<string, number[]>;

/** Per-team, per-stint-index tags. Passed into the engine — never module globals. */
export interface Tags {
  drivers: Record<string, string[]>;
  karts: Record<string, string[]>;
}

export type StintTier = 'Ace' | 'Core' | 'Backup';

/** Result of outlier filtering (IQR fence on the slow side). */
export interface CleanResult {
  clean: number[];
  out: { lap: number; t: number }[];
}

/** A contiguous run between pit stops — conceptually a (driver × kart) tuple. */
export interface Stint {
  idx: number;
  n: number;
  start: number;
  end: number;
  best: number;
  median: number;
  mean: number;
  std: number;
  cov: number;
  duration: number;
  laps: number[];
  tier?: StintTier;
}

/** Full per-team analysis row (sorted into race position by `analyse`). */
export interface TeamAnalysis {
  name: string;
  color: string;
  laps: number[];
  n: number;
  hasGridLap: boolean;
  best: number;
  median: number;
  mean: number;
  std: number;
  cov: number;
  deg: number;
  total: number;
  vTotal: number;
  vN: number;
  removed: number[];
  out: { lap: number; t: number }[];
  clean: number[];
  stints: Stint[];
  pos: number;
  lapsDown: number;
  gap: string;
  gapBest: number;
}

/** Two-way additive decomposition of stint medians into driver + kart effects. */
export interface EffectsModel {
  grand: number;
  driverEffect: Record<string, number>;
  kartEffect: Record<string, number>;
  r2: number;
  nObs: number;
  crossover: boolean;
}

/** A driver aggregated across the whole field (driver leaderboard row). */
export interface DriverRow {
  name: string;
  team: string;
  color: string;
  karts: string[];
  stints: number;
  laps: number;
  best: number;
  median: number;
  mean: number;
  std: number;
  cov: number;
  deg: number;
  /** Kart-adjusted pace (expected lap in an average kart); null when not estimable. */
  adj: number | null;
  rank: number;
  tier: StintTier;
}

/** Driver leaderboard plus the model context used to rank it. */
export interface DriverBoard {
  rows: DriverRow[];
  effects: EffectsModel | null;
  /** True when every driver has an estimate, so ranking is kart-adjusted. */
  useAdjusted: boolean;
}

/** A recovered kart pace rating (kart leaderboard row). */
export interface KartRow {
  kart: string;
  effect: number;
  stints: number;
  drivers: number;
  rawMedian: number | null;
  rank: number;
}

/** A structured race insight (the view composes the narrative). */
export interface Insight {
  mark: string;
  subject: string;
  /** Optional headline metric (lap time, s/lap, etc.). */
  metric?: number;
}

/** A structured lineup recommendation. */
export interface Reco {
  mark: string;
  text: string;
}
