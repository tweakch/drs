---
id: DRS-0009
slice: f1-seed-ingestion
type: analysis
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0009-f1-seed-ingestion.story.md
---

# Analysis — DRS-0009 · F1 data ingestion → idempotent DB seeds

> Strategic context framing the Canvas. The slice gives DRS realistic, lap-accurate
> seed data by ingesting real F1 races, mapping them onto the existing race domain and
> emitting idempotent SQL for the prod DB.

## Domain keywords

- **Race / Team / Lap** ([`../shared/entities.md`](../shared/entities.md)) — the target
  model. An F1 Grand Prix → one `Race`; each car → one `Team` row (the lap-sequence
  owner); its lap times → `Lap` rows. No `Stint`/`Kart` decomposition (F1 has no
  driver×kart crossover).
- **Track** — promoted from an embedded value to a first-class table (Ergast circuit).
- **Constructor** (new) — the F1 "team"; **Driver** — promoted to a persisted catalogue
  entry (was only a user-tag on stints).
- **Idempotent seed / natural key** — `ref` (Ergast id) and `source_ref`
  (`f1:<season>:<round>[:<driver>]`) make every upsert repeatable.

## Prototype references

None directly — this is a data/ingestion slice, not a view. It reuses the prototype's
`TRACK_PATH` (via [`../../lib/race/sample-race.ts`](../../lib/race/sample-race.ts), DRS-0008)
as the stand-in `layout` for F1 circuits so the Replay view can still animate.

## Existing code touched

- [`../../lib/db/schema.sql`](../../lib/db/schema.sql) — additive tables + columns.
- [`../../lib/db/queries.ts`](../../lib/db/queries.ts) — a read seam for seeded races.
- [`../../lib/db/migrate.ts`](../../lib/db/migrate.ts) — the pattern the seed runner mirrors
  (`node --experimental-strip-types`, env-direct, no `@/` alias).
- [`../../package.json`](../../package.json), [`../../tsconfig.json`](../../tsconfig.json)
  — `pnpm seed*` scripts; `allowImportingTsExtensions` for the Node `.ts` script imports.

## Key decisions & trade-offs

1. **Data source = Jolpica/Ergast** (vs OpenF1). Free, no key, stable, and exposes exactly
   circuits/constructors/drivers/results/laps. OpenF1 is richer for telemetry but flakier
   and shallower historically. (Locked at clarify gate.)
2. **Map onto existing race/team/lap + extend schema** (vs schema-only-reuse). Each car is a
   `Team` row; new `tracks`/`constructors`/`drivers` tables model the F1 entities as
   first-class. All changes are **additive + idempotent** so kart-domain data is untouched.
3. **Three-stage pipeline** — `fetch` (network → committed JSON fixtures), `generate` (pure
   transform → committed idempotent SQL), `seed` (apply SQL). Separation keeps prod seeding
   **offline + deterministic** and puts the only testable logic (the transform) behind a
   pure function. Fixtures + SQL are committed for reviewable diffs.
4. **Idempotency via natural keys** — `on conflict (ref|source_ref|(team_id,idx)) do update`.
   No DELETEs; safe to run against prod repeatedly; never destructively overwrites a race.
5. **Replay stand-in layout** — Ergast has no geometry, so F1 tracks reuse the Wohlen SVG
   path. Accurate per-circuit geometry is out of scope. (Locked at clarify gate.)
6. **Ownerless public sample data** — seeded races carry no `Event`/owner, mirroring
   DRS-0008's embedded race; the read seam filters on `source_ref` so it never returns a
   tenant race.

## Risks & unknowns

- **Lap pagination** — Ergast paginates lap _timings_ (1338 for this race); a lap's timings
  can split across pages → merge by lap number before normalizing. (Handled in the fetcher.)
- **Node `.ts` script imports** — `--experimental-strip-types` needs explicit `.ts`
  specifiers; `tsc` needs `allowImportingTsExtensions`. Verified end-to-end by running fetch.
- **`tracks.length_m`** — Ergast omits circuit length → small static table + default.
- **Prod seeding needs `DATABASE_URL`** — CI cannot run `pnpm seed` (no DB); the pure
  transform is the CI-tested unit. The SQL is applied manually/once against prod.
- **Rate limits** — Jolpica throttles; the fetcher sleeps between pages.

## Suggested Operations outline

1. Schema: `tracks`/`constructors`/`drivers` + nullable FKs + natural-key unique indexes.
2. Static reference data (circuit lengths, constructor colours, stand-in layout).
3. Jolpica Zod schemas (boundary validation).
4. Pure transform: `parseLapTime`, `buildFixture`, `fixtureToSql` (+ unit tests).
5. Scripts: `fetch` → fixtures, `generate` → SQL, `seed` runner; `pnpm seed*`.
6. Read seam in `queries.ts`; verify; commit fixtures + SQL.
