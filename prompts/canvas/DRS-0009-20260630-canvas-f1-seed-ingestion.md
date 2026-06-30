---
id: DRS-0009
slice: f1-seed-ingestion
type: canvas
status: implemented
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0009-f1-seed-ingestion.story.md
source_analysis: ../analysis/DRS-0009-20260630-analysis-f1-seed-ingestion.md
depends_on: DRS-0002-app-scaffold
---

# REASONS Canvas — DRS-0009 · F1 data ingestion → idempotent DB seeds

## R — Requirements

Ingest the **latest completed F1 race** from Jolpica/Ergast and emit **idempotent SQL**
seeds (tracks, constructors, drivers, race, laps) for the prod DB, as realistic sample
data. **DoD:** additive+idempotent schema extension; a `fetch → generate → seed` pipeline
where prod seeding is offline/deterministic and safe to repeat; seeded races are ownerless
public sample data; the pure transform is unit-tested; `format/lint/typecheck/test` green.

**Out of scope:** OpenF1/telemetry; kart-effect analytics for F1; import UI; per-circuit
geometry (reuse Wohlen layout); seeding >1 race; live app-wiring of the read seam.

## E — Entities

References [`../shared/entities.md`](../shared/entities.md). Promotes/adds first-class
**Track**, **Constructor**, **Driver** (catalogue) tables; maps an F1 GP → `Race`, each car
→ `Team` (driver+constructor tagged), its lap times → `Lap`. **Deltas:** see the new
"F1 ingestion entities (DRS-0009)" section in the shared model.

## A — Approach

Three separable stages: **fetch** (network, dev-time → committed JSON fixture), **generate**
(pure transform → committed idempotent SQL), **seed** (apply SQL via a runner). The only
non-trivial logic — time parsing, normalization, SQL emission — is a **pure, tested**
function. Idempotency comes from natural-key upserts (`ref`, `source_ref`, `(team_id,idx)`);
no DELETEs. F1 circuits reuse the Wohlen SVG `layout` so Replay still animates. Seed scripts
mirror `migrate.ts` (`node --experimental-strip-types`, env-direct).

## S — Structure

```
lib/db/schema.sql                       ← +tracks/constructors/drivers, +FK columns, +uniq idx (additive)
lib/db/seeds/f1/static.ts               ← circuit lengths, constructor colours, Wohlen stand-in layout
lib/db/seeds/f1/jolpica.ts              ← Zod schemas for the Jolpica responses (boundary validation)
lib/db/seeds/f1/types.ts                ← normalized fixture types (no runtime deps)
lib/db/seeds/f1/transform.ts            ← PURE: parseLapTime, buildFixture, fixtureToSql
lib/db/seeds/f1/transform.test.ts       ← unit tests (parse, normalize, idempotent SQL, escaping)
lib/db/seeds/f1/fetch.ts                ← stage 1: Jolpica → fixtures/f1-<season>-<round>.json
lib/db/seeds/f1/generate.ts             ← stage 2: fixtures → sql/seed-f1-<season>-<round>.sql
lib/db/seeds/f1/fixtures/*.json         ← committed normalized fixtures (latest race)
lib/db/seeds/f1/sql/*.sql               ← committed idempotent seed SQL
lib/db/seed.ts                          ← stage 3: `pnpm seed` applies SQL (txn per file), verifies counts
lib/db/queries.ts                       ← getLatestSeededRace() read seam (filters on source_ref)
package.json                            ← seed / seed:fetch / seed:build scripts
tsconfig.json                           ← allowImportingTsExtensions (Node .ts script imports)
```

No new deps (reuses `zod` + `@neondatabase/serverless`).

## O — Operations

1. **Schema (additive/idempotent).** `tracks`, `constructors`, `drivers`; nullable FKs
   `races.track_id`, `teams.driver_id|constructor_id`; `season/round/source_ref`; partial
   unique indexes on `source_ref` + unique `(team_id, idx)`.
   - _Accept:_ `pnpm migrate` is a no-op on re-run; kart-domain tables/rows untouched.
2. **Pure transform.** `parseLapTime` (`M:SS.mmm`|secs); `buildFixture` (dedupe
   constructors/drivers, merge laps per driver, winner-millis duration, stand-in length);
   `fixtureToSql` (natural-key upserts, single-quote escaping, layout as `jsonb`).
   - _Accept:_ unit tests pass — parse cases, normalization, `on conflict … do update` for
     every entity, `''` escaping, deterministic output.
3. **Fetch stage.** Resolve latest (`current/last`), page+merge laps, Zod-validate, write a
   committed fixture.
   - _Accept:_ `pnpm seed:fetch` writes `fixtures/f1-2026-8.json` (22 cars, 1338 laps).
4. **Generate stage.** Pure fixtures → committed SQL.
   - _Accept:_ `pnpm seed:build` writes `sql/seed-f1-2026-8.sql`; re-running is byte-stable.
5. **Seed runner.** `pnpm seed` applies each SQL file in a transaction, then prints seeded
   race/car/lap counts. Offline; safe to repeat against prod.
   - _Accept:_ idempotent (second run = same row counts, no duplicates).
6. **Read seam.** `getLatestSeededRace()` returns the latest `source_ref` race with car/lap
   counts (never a tenant race).
   - _Accept:_ typechecks; filtered on `source_ref is not null`.
7. **Verify.** `format/lint/typecheck/test` green.

## N — Norms (deltas)

Inherit [`../shared/norms.md`](../shared/norms.md). Transform is pure/framework-free and
tested; external API validated with Zod at the boundary; seed scripts mirror `migrate.ts`
(no `@/` alias, env-direct). `allowImportingTsExtensions` enables Node `.ts` script imports.

## S — Safeguards (deltas)

Inherit [`../shared/safeguards.md`](../shared/safeguards.md). Schema changes are
**forward-only + additive**; seeds are **idempotent, non-destructive** (no DELETE, never
overwrites a canonical race). No secrets: the runner reads `DATABASE_URL` server-side only.
Seeded races are public sample data; the read seam can never return an event-scoped race.

## Changelog

- 2026-06-30 — created and implemented. Source = latest completed F1 race (2026 Austrian
  GP, round 8); Wohlen stand-in layout; ownerless public sample data. Gates green.
