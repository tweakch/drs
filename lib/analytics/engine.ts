// Analytics engine — SIGNATURES ONLY for DRS-0002. Bodies are ported and
// golden-master tested in a later slice. Keep this file pure: no React/DOM/Next.

import type { Driver, Kart, Stint, Team } from '@/types';
import type { CleanResult, EffectsModel, RawLaps } from './types';

const NOT_IMPLEMENTED =
  'not implemented — analytics engine bodies land in a later golden-master slice';

/** Parse pasted lap data ("Name: 53.4, 54.1" or "Kart,Lap,Time" rows). */
export function parseInput(_text: string): RawLaps {
  throw new Error(NOT_IMPLEMENTED);
}

/** Remove pit/traffic outliers via the IQR fence on the slow side. */
export function cleanLaps(_times: number[]): CleanResult {
  throw new Error(NOT_IMPLEMENTED);
}

/** Linear regression slope of clean lap time over lap index (s/lap). */
export function degradation(_times: number[]): number {
  throw new Error(NOT_IMPLEMENTED);
}

/** Split a team's lap list into stints at driver-change / pit laps. */
export function splitStints(_laps: number[]): Stint[] {
  throw new Error(NOT_IMPLEMENTED);
}

/** Tag each stint Ace / Core / Backup against the field's Q1 / Q3 of medians. */
export function classifyStints(_data: Team[]): void {
  throw new Error(NOT_IMPLEMENTED);
}

/** stint_median ≈ grand + kartEffect + driverEffect (alternating mean-removal). */
export function estimateEffects(_data: Team[]): EffectsModel | null {
  throw new Error(NOT_IMPLEMENTED);
}

/** Roll every stint up by driver across the field, ranked on kart-adjusted pace. */
export function driverLeaderboard(_data: Team[]): Driver[] {
  throw new Error(NOT_IMPLEMENTED);
}

/** Recovered hidden kart pace ratings, fastest first. */
export function kartLeaderboard(_data: Team[]): Kart[] | null {
  throw new Error(NOT_IMPLEMENTED);
}

/** Full race analysis: positions, gaps, KPIs (optionally drop slowest N laps). */
export function analyse(_karts: RawLaps, _dropSlowest = 0): Team[] {
  throw new Error(NOT_IMPLEMENTED);
}
