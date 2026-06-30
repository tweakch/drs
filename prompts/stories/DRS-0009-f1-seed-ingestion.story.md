---
id: DRS-0009
slice: f1-seed-ingestion
type: story
status: approved
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0002-app-scaffold
---

# DRS-0009 · F1 data ingestion → idempotent DB seeds

## Story

**As a** maintainer standing up DRS with no real kart races yet
**I want** a script that fetches real Formula 1 races from a public API and emits
idempotent SQL seeds (tracks, constructors, drivers, races, laps)
**so that** I can populate the prod database with realistic, lap-accurate race data to
demo the Replay, Race-result, Team and Driver views before real kart timing exists.

## Context

The app's domain is endurance **kart** racing (`races → teams → laps`; analytics
decompose pace into **driver × kart** effects — see
[`../shared/entities.md`](../shared/entities.md)). We have schema + a `pnpm migrate`
runner ([`../../lib/db/schema.sql`](../../lib/db/schema.sql),
[`../../lib/db/migrate.ts`](../../lib/db/migrate.ts)) but **no seed data** in prod.

F1 has rich, free, lap-by-lap public timing. We use the **Jolpica API** (the maintained
Ergast successor, `https://api.jolpi.ca/ergast/f1/…`, no key) because it exposes exactly
the entities we want — circuits, constructors, drivers, race results, and per-lap times —
as stable historical data ideal for deterministic seeds.

F1 is **one driver per car** with no kart-sharing, so this data drives Replay, Race
result, pace and degradation, but **not** the Kart/Detektiv decomposition (no
driver×kart crossover). Each F1 car maps to one DRS "team" row (the lap-sequence owner),
tagged with its `driver` and `constructor`. To model drivers/constructors/tracks as
first-class (not just embedded strings), this slice **extends the schema** additively.

Scope is locked (clarify gate): seed **only the latest completed F1 race**; seeded races
are **ownerless public sample data** (no Event/owner, like DRS-0008); and because Jolpica
has no circuit geometry, F1 tracks **reuse the existing Wohlen SVG layout** as a stand-in
so Replay still animates. Kept as **one slice** for now.

Pipeline is three separable stages so prod seeding is offline, reviewable and
deterministic: **fetch** (network, dev-time → committed JSON fixtures) → **generate**
(pure transform → committed idempotent SQL) → **seed** (apply SQL to DB via a runner).

## Acceptance criteria

- [ ] **Schema extension** (additive, idempotent): first-class `tracks`,
      `constructors`, `drivers` tables, plus nullable FKs linking `races → tracks` and
      `teams → drivers`/`constructors`. Existing kart-domain tables/data unaffected;
      re-running `pnpm migrate` is a no-op.
- [ ] **Fetcher**: a dev-time script pulls **the latest completed F1 race** (most recent
      round) from Jolpica — its circuit, constructors, drivers, results, and per-lap
      times — and writes **normalized JSON fixtures** under `lib/db/seeds/f1/`, committed
      to the repo. It throttles to respect Jolpica rate limits and paginates lap data.
      (Season/round is a config knob so more races can be added later.)
- [ ] **Seed generation**: a **pure** transform turns committed fixtures into
      **idempotent SQL** seed files (upserts keyed on natural keys: Ergast
      circuit/driver/constructor refs, season+round) — safe to run repeatedly. F1 tracks
      are seeded with the **Wohlen SVG layout** as a stand-in so Replay renders.
- [ ] **Ownership**: seeded races are **ownerless public sample data** — no Event/owner
      row — consistent with DRS-0008's embedded sample race.
- [ ] **Seed runner**: `pnpm seed` applies the generated SQL against `DATABASE_URL`
      (mirrors `pnpm migrate`), **offline** (no API calls at seed time), and is **safe to
      run against prod** — idempotent, no destructive statements, no overwrite of an
      existing canonical race.
- [ ] Seeded data is queryable through the existing race read path (the seeded F1 GP
      renders as a race with its teams/laps); driver/constructor/track names resolve.
- [ ] `../shared/entities.md` is updated to add the new first-class entities (done in the
      Canvas's **E** as part of the same change).
- [ ] `format/lint/typecheck/test/build` green; the pure transform is unit-tested.

## INVEST check

- **Independent** — depends only on the DB scaffold (DRS-0002); no other unshipped slice.
- **Negotiable** — which/how many F1 races to seed; track-layout handling; exact table
  shapes.
- **Valuable** — real, lap-accurate seed data turns empty views into a live demo and a
  sign-in funnel target (pairs with DRS-0008 landing replay).
- **Estimable** — yes; Jolpica is well-documented and the stages are well-bounded.
- **Small** — ⚠ **on the large side** (migration + fetcher + generator + runner). If it
  fails "Small" at the clarify gate, split into: **DRS-0009a** schema extension,
  **DRS-0009b** Jolpica fetcher → fixtures, **DRS-0009c** seed generation + runner.
- **Testable** — pure fixtures→SQL transform unit-tested; idempotency verified by
  double-apply; gates green; a seeded race reads back correctly.

## Out of scope

- OpenF1 / live telemetry, sectors, positions, tyre stints.
- Kart-effect analytics for F1 (no driver×kart crossover — Kart/Detektiv stay empty for
  F1 races).
- UI to browse/select F1 races; an admin "import" button; scheduled/auto ingestion.
- Non-F1 series; real kart-timing ingestion (a separate later slice).
- Accurate per-circuit SVG track geometry (we reuse the Wohlen layout as a stand-in).
- Seeding more than the latest race (the fetcher is configurable, but scope is one race).

## Open questions (resolved at the clarify gate)

- **Which races to seed?** → **The latest completed F1 race** (most recent round).
  Fetcher stays configurable for adding more later.
- **Track layout / Replay?** → **Reuse the Wohlen SVG layout** as a stand-in for F1
  tracks so Replay still animates (no per-circuit geometry).
- **Event scoping?** → **Ownerless public sample data** (no Event/owner), like DRS-0008.
- **Where do fixtures + SQL live?** → **`lib/db/seeds/f1/`**, committed to git (one
  race's lap volume is small enough; Blob not needed).
