// Race-level KPI roll-up over a finished analysis. Pure.

import { TRACK_PB, mean } from './engine';
import type { TeamAnalysis } from './types';

export interface RaceSummary {
  teams: number;
  /** Total laps completed across the field (grid crossings excluded). */
  laps: number;
  /** Fastest single racing lap in the field. */
  fieldBest: number;
  /** Team that set the field-best lap. */
  fieldBestTeam: string;
  /** Field best minus the track PB reference (negative = a new benchmark). */
  pbDelta: number;
  /** Mean coefficient of variation across teams (consistency of the field). */
  avgCov: number;
}

export function raceSummary(data: TeamAnalysis[]): RaceSummary {
  if (!data.length) {
    return { teams: 0, laps: 0, fieldBest: 0, fieldBestTeam: '—', pbDelta: 0, avgCov: 0 };
  }
  const best = [...data].sort((a, b) => a.best - b.best)[0];
  return {
    teams: data.length,
    laps: data.reduce((sum, d) => sum + d.n, 0),
    fieldBest: best.best,
    fieldBestTeam: best.name,
    pbDelta: best.best - TRACK_PB,
    avgCov: mean(data.map((d) => d.cov)),
  };
}
