// Zod schemas for the slice of the Jolpica/Ergast API we consume. Used by the
// fetcher to validate every response at the boundary (Norm: validate external
// input with Zod). Only the fields we persist are modelled; unknown keys pass.
//
// Endpoints (base https://api.jolpi.ca/ergast/f1):
//   /current/last/results.json        → season, round, race meta, Circuit, Results[]
//   /{season}/{round}/laps.json        → Laps[] with per-driver Timings[] (paginated)

import { z } from 'zod';

const Location = z.object({
  locality: z.string().optional(),
  country: z.string().optional(),
});

const Circuit = z.object({
  circuitId: z.string(),
  circuitName: z.string(),
  Location: Location.optional(),
});

const Driver = z.object({
  driverId: z.string(),
  code: z.string().optional(),
  permanentNumber: z.string().optional(),
  givenName: z.string(),
  familyName: z.string(),
  nationality: z.string().optional(),
});

const Constructor = z.object({
  constructorId: z.string(),
  name: z.string(),
  nationality: z.string().optional(),
});

const ResultItem = z.object({
  number: z.string().optional(),
  position: z.string().optional(),
  grid: z.string().optional(),
  status: z.string().optional(),
  Driver,
  Constructor,
  Time: z.object({ millis: z.string().optional() }).optional(),
});

const ResultsRace = z.object({
  season: z.string(),
  round: z.string(),
  raceName: z.string(),
  date: z.string(),
  Circuit,
  Results: z.array(ResultItem),
});

export const ResultsResponse = z.object({
  MRData: z.object({
    RaceTable: z.object({ Races: z.array(ResultsRace) }),
  }),
});

const Timing = z.object({
  driverId: z.string(),
  time: z.string(),
});

const Lap = z.object({
  number: z.string(),
  Timings: z.array(Timing),
});

const LapsRace = z.object({
  season: z.string(),
  round: z.string(),
  Laps: z.array(Lap),
});

export const LapsResponse = z.object({
  MRData: z.object({
    limit: z.string(),
    offset: z.string(),
    total: z.string(),
    RaceTable: z.object({ Races: z.array(LapsRace) }),
  }),
});

export type ResultsResponse = z.infer<typeof ResultsResponse>;
export type LapsResponse = z.infer<typeof LapsResponse>;
export type ResultsRace = z.infer<typeof ResultsRace>;
export type LapsRace = z.infer<typeof LapsRace>;
