// Pure transform core for the F1 seed pipeline. No I/O, no clock, no randomness —
// deterministic so it can be unit-tested in milliseconds (Norm: pure lib code).
//
//   parseLapTime  "M:SS.mmm" | "SS.mmm" | "H:MM:SS.mmm" -> seconds
//   buildFixture  validated Jolpica response       -> normalized RaceFixture
//   fixtureToSql  RaceFixture                       -> idempotent SQL (upserts)

import type { ResultsRace, LapsRace } from './jolpica.ts';
import type {
  ConstructorFixture,
  DriverFixture,
  EntryFixture,
  LapFixture,
  RaceFixture,
} from './types.ts';
import {
  CIRCUIT_LENGTHS_M,
  CONSTRUCTOR_COLORS,
  DEFAULT_CIRCUIT_LENGTH_M,
  FALLBACK_COLORS,
  WOHLEN_STANDIN_LAYOUT,
} from './static.ts';

/** Parse an Ergast lap/time string into seconds. Throws on an unparseable value. */
export function parseLapTime(raw: string): number {
  const parts = raw.trim().split(':');
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) {
    throw new Error(`[DRS] unparseable lap time: ${JSON.stringify(raw)}`);
  }
  if (nums.length === 1) return nums[0]!;
  if (nums.length === 2) return nums[0]! * 60 + nums[1]!;
  if (nums.length === 3) return nums[0]! * 3600 + nums[1]! * 60 + nums[2]!;
  throw new Error(`[DRS] unparseable lap time: ${JSON.stringify(raw)}`);
}

function colorFor(constructorId: string, index: number): string {
  return CONSTRUCTOR_COLORS[constructorId] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
}

function intOrNull(v: string | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Normalize a validated Jolpica results race + its (merged) laps into a fixture. */
export function buildFixture(args: {
  race: ResultsRace;
  laps: LapsRace['Laps'];
  fetchedAt: string;
}): RaceFixture {
  const { race, laps, fetchedAt } = args;
  const season = Number(race.season);
  const round = Number(race.round);
  const sourceRef = `f1:${season}:${round}`;

  // Lap times per driver, ordered by lap index.
  const lapsByDriver = new Map<string, LapFixture[]>();
  for (const lap of laps) {
    const idx = Number(lap.number);
    for (const t of lap.Timings) {
      const list = lapsByDriver.get(t.driverId) ?? [];
      list.push({ idx, timeS: parseLapTime(t.time) });
      lapsByDriver.set(t.driverId, list);
    }
  }
  for (const list of lapsByDriver.values()) list.sort((a, b) => a.idx - b.idx);

  // Dedupe constructors / drivers (a result row each), preserving first-seen order.
  const constructors = new Map<string, ConstructorFixture>();
  const drivers = new Map<string, DriverFixture>();
  const entries: EntryFixture[] = [];

  race.Results.forEach((r, i) => {
    const cId = r.Constructor.constructorId;
    if (!constructors.has(cId)) {
      constructors.set(cId, {
        ref: cId,
        name: r.Constructor.name,
        nationality: r.Constructor.nationality ?? null,
        color: colorFor(cId, constructors.size),
      });
    }
    const dId = r.Driver.driverId;
    if (!drivers.has(dId)) {
      drivers.set(dId, {
        ref: dId,
        code: r.Driver.code ?? null,
        givenName: r.Driver.givenName,
        familyName: r.Driver.familyName,
        nationality: r.Driver.nationality ?? null,
        permanentNumber: intOrNull(r.Driver.permanentNumber),
      });
    }
    entries.push({
      sourceRef: `${sourceRef}:${dId}`,
      driverRef: dId,
      constructorRef: cId,
      name: `${r.Driver.givenName} ${r.Driver.familyName}`,
      color: constructors.get(cId)!.color,
      grid: intOrNull(r.grid),
      position: intOrNull(r.position),
      status: r.status ?? null,
      laps: lapsByDriver.get(dId) ?? [],
    });
    void i;
  });

  const winnerMillis = intOrNull(race.Results.find((r) => r.position === '1')?.Time?.millis);
  const durationS = winnerMillis != null ? Math.round(winnerMillis / 1000) : 0;

  const circuitId = race.Circuit.circuitId;
  return {
    source: 'jolpica',
    sourceRef,
    season,
    round,
    fetchedAt,
    name: `${race.raceName} ${season}`,
    date: race.date,
    durationS,
    track: {
      ref: circuitId,
      name: race.Circuit.circuitName,
      lengthM: CIRCUIT_LENGTHS_M[circuitId] ?? DEFAULT_CIRCUIT_LENGTH_M,
      country: race.Circuit.Location?.country ?? null,
      locality: race.Circuit.Location?.locality ?? null,
    },
    constructors: [...constructors.values()],
    drivers: [...drivers.values()],
    entries,
  };
}

// --- SQL emission ----------------------------------------------------------

const q = (v: string): string => `'${v.replace(/'/g, "''")}'`;
const qN = (v: string | null): string => (v == null ? 'null' : q(v));
const nN = (v: number | null): string => (v == null || !Number.isFinite(v) ? 'null' : String(v));

/**
 * Render a fixture as idempotent SQL: every statement upserts on a natural key
 * (`ref` / `source_ref` / `(team_id, idx)`), so the file is safe to apply against
 * prod repeatedly with no duplicates. No DELETEs; the canonical race is never
 * overwritten destructively. Returns plain statements (the runner wraps a txn).
 */
export function fixtureToSql(f: RaceFixture): string {
  const out: string[] = [];
  out.push(`-- DRS-0009 F1 seed — ${f.name} (${f.sourceRef}); generated from fixture.`);
  out.push(`-- source: ${f.source} · fetched ${f.fetchedAt} · ${f.entries.length} cars.`);

  // tracks
  out.push(
    `insert into tracks (ref, name, length_m, country, locality, layout) values\n` +
      `  (${q(f.track.ref)}, ${q(f.track.name)}, ${nN(f.track.lengthM)}, ${qN(f.track.country)}, ${qN(f.track.locality)}, ${q(JSON.stringify(WOHLEN_STANDIN_LAYOUT))}::jsonb)\n` +
      `on conflict (ref) do update set name = excluded.name, length_m = excluded.length_m,\n` +
      `  country = excluded.country, locality = excluded.locality, layout = excluded.layout;`,
  );

  // constructors
  out.push(
    `insert into constructors (ref, name, nationality) values\n` +
      f.constructors.map((c) => `  (${q(c.ref)}, ${q(c.name)}, ${qN(c.nationality)})`).join(',\n') +
      `\non conflict (ref) do update set name = excluded.name, nationality = excluded.nationality;`,
  );

  // drivers
  out.push(
    `insert into drivers (ref, code, given_name, family_name, nationality, permanent_number) values\n` +
      f.drivers
        .map(
          (d) =>
            `  (${q(d.ref)}, ${qN(d.code)}, ${q(d.givenName)}, ${q(d.familyName)}, ${qN(d.nationality)}, ${nN(d.permanentNumber)})`,
        )
        .join(',\n') +
      `\non conflict (ref) do update set code = excluded.code, given_name = excluded.given_name,\n` +
      `  family_name = excluded.family_name, nationality = excluded.nationality,\n` +
      `  permanent_number = excluded.permanent_number;`,
  );

  // race (track_id resolved by sub-select on the natural key)
  out.push(
    `insert into races (name, track_name, track_length_m, date, format, duration_s, season, round, source_ref, track_id) values\n` +
      `  (${q(f.name)}, ${q(f.track.name)}, ${nN(f.track.lengthM)}, ${q(f.date)}, 'grand_prix', ${nN(f.durationS)}, ${nN(f.season)}, ${nN(f.round)}, ${q(f.sourceRef)},\n` +
      `   (select id from tracks where ref = ${q(f.track.ref)}))\n` +
      `on conflict (source_ref) do update set name = excluded.name, track_name = excluded.track_name,\n` +
      `  track_length_m = excluded.track_length_m, date = excluded.date, format = excluded.format,\n` +
      `  duration_s = excluded.duration_s, season = excluded.season, round = excluded.round,\n` +
      `  track_id = excluded.track_id;`,
  );

  // teams (one per car; race_id / driver_id / constructor_id via sub-selects)
  out.push(
    `insert into teams (race_id, name, color, source_ref, driver_id, constructor_id) values\n` +
      f.entries
        .map(
          (e) =>
            `  ((select id from races where source_ref = ${q(f.sourceRef)}), ${q(e.name)}, ${q(e.color)}, ${q(e.sourceRef)},\n` +
            `   (select id from drivers where ref = ${q(e.driverRef)}), (select id from constructors where ref = ${q(e.constructorRef)}))`,
        )
        .join(',\n') +
      `\non conflict (source_ref) do update set race_id = excluded.race_id, name = excluded.name,\n` +
      `  color = excluded.color, driver_id = excluded.driver_id, constructor_id = excluded.constructor_id;`,
  );

  // laps (one statement per car; team_id resolved once via sub-select)
  for (const e of f.entries) {
    if (e.laps.length === 0) continue;
    out.push(
      `insert into laps (team_id, idx, time_s)\n` +
        `select (select id from teams where source_ref = ${q(e.sourceRef)}), v.idx, v.time_s\n` +
        `from (values\n` +
        e.laps.map((l) => `  (${nN(l.idx)}, ${nN(l.timeS)})`).join(',\n') +
        `\n) as v(idx, time_s)\n` +
        `on conflict (team_id, idx) do update set time_s = excluded.time_s;`,
    );
  }

  return out.join('\n\n') + '\n';
}
