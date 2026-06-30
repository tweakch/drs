// Engine-facing types for the analytics module.

/** Parsed lap input: kart/team name → ordered lap times in seconds. */
export type RawLaps = Record<string, number[]>;

/** Result of outlier filtering (IQR fence on the slow side). */
export interface CleanResult {
  clean: number[];
  out: { lap: number; t: number }[];
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
