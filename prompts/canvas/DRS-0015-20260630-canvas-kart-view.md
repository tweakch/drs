---
id: DRS-0015
slice: kart-view
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Kart view, ledger K1–K4)
---

# REASONS Canvas — DRS-0015 · Kart view (pace ratings)

> Wave 2, Canvas 3. The recovered hidden kart pace ratings.

## R — Requirements

**In scope (ledger).** K1 kart pace ratings table · K2 pace-effect vs-fastest bars ·
K3 usage stats (stints / drivers) · K4 empty-state gating (no kart tags → prompt).

**Out of scope.** Editing; the Detektiv solver (Wave 3).

**Definition of done.** `/kart` lists each kart's recovered pace effect (negative =
faster) with a vs-fastest bar and usage; shows an empty state when not estimable.
Gates green; browser-verified.

## E — Entities

- Route `app/(app)/kart/page.tsx` (server) → `kartLeaderboard(analyse(raw), tags)`.
- `components/kart/KartRatings.tsx` — table + bars; empty-state when `null`.

## A — Assumptions

- `kartLeaderboard` returns `null` unless stints carry kart tags with crossover; the
  tagged demo provides it. The bar length scales to the slowest kart's gap.

## S — Sequence

1. Server computes `rows = kartLeaderboard(data, tags)`.
2. If `null` → empty state (K4). Else table: rank, kart #, pace effect, vs-fastest
   bar (K2), stints, drivers (K3).

## N — Non-functionals

Server component, (app) auth group, no new deps.

## S — Surface

Browser: ratings table fastest-first, bars scale, usage columns; empty state path.
