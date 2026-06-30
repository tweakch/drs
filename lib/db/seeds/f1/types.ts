// Normalized fixture shape — the committed, source-agnostic intermediate the
// fetcher writes and the SQL generator reads. Plain TS types, no runtime deps, so
// the pure transform and its tests stay dependency-free.

/** A circuit as we persist it (Ergast circuit + supplied geometry stand-in). */
export interface TrackFixture {
  ref: string;
  name: string;
  lengthM: number;
  country: string | null;
  locality: string | null;
}

/** An F1 constructor with its assigned livery colour. */
export interface ConstructorFixture {
  ref: string;
  name: string;
  nationality: string | null;
  color: string;
}

/** An F1 driver catalogue entry. */
export interface DriverFixture {
  ref: string;
  code: string | null;
  givenName: string;
  familyName: string;
  nationality: string | null;
  permanentNumber: number | null;
}

/** One lap by one car: 1-based lap index and its time in seconds. */
export interface LapFixture {
  idx: number;
  timeS: number;
}

/** One car in the race — maps to a DRS `team` row (the lap-sequence owner). */
export interface EntryFixture {
  /** Stable per-car seed key, e.g. `f1:2026:8:russell`. */
  sourceRef: string;
  driverRef: string;
  constructorRef: string;
  /** Display name for the team row, e.g. "George Russell". */
  name: string;
  color: string;
  grid: number | null;
  position: number | null;
  status: string | null;
  laps: LapFixture[];
}

/** A whole Grand Prix, normalized and ready to turn into idempotent SQL. */
export interface RaceFixture {
  source: 'jolpica';
  /** Stable per-race seed key, e.g. `f1:2026:8`. */
  sourceRef: string;
  season: number;
  round: number;
  fetchedAt: string;
  name: string;
  date: string;
  durationS: number;
  track: TrackFixture;
  constructors: ConstructorFixture[];
  drivers: DriverFixture[];
  entries: EntryFixture[];
}
