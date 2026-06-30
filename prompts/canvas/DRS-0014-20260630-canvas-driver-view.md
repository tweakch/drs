---
id: DRS-0014
slice: driver-view
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Driver view, ledger V1–V6)
---

# REASONS Canvas — DRS-0014 · Driver view (leaderboard)

> Wave 2, Canvas 2. The kart-adjusted driver leaderboard + lineup recos.

## R — Requirements

**In scope (ledger).** V1 driver leaderboard table · V2 kart-adjusted pace column ·
V3 kart-Δ (luck) column · V4 model-quality banner (R²) · V5 tier classification ·
V6 lineup recommendations.

**Out of scope.** Kart ratings table (next canvas), editing.

**Definition of done.** `/leaderboard` ranks drivers on kart-adjusted pace (raw
fallback), shows Adj/Δ columns + R² banner when estimable, tiers, and recos. Gates
green; browser-verified.

## E — Entities

- Route `app/(app)/leaderboard/page.tsx` (server) → `driverLeaderboard(analyse(raw), tags)`
  - `lineupRecos(board)` on the tagged demo race.
- `components/driver/Leaderboard.tsx` — table + banner; `components/driver/Recos.tsx`.

## A — Assumptions

- The tagged demo's rotation makes the effects model identifiable → `useAdjusted`
  true → Adj pace + kart-Δ columns and the R² banner appear (V2–V4). On untagged
  data the engine falls back to raw median ranking (banner explains it).
- Kart-Δ = median − (grand + adj): + means slower karts than average (kart luck).

## S — Sequence

1. Server computes `board = driverLeaderboard(data, tags)`, `recos = lineupRecos(board)`.
2. `Leaderboard` renders rank/driver/tier/stints/laps/best/median, plus Adj pace +
   kart-Δ when `useAdjusted`, then σ/CoV/Deg; a model banner above it.
3. `Recos` renders Start/Anchor/Watch/Stamina/Kart-luck cards.

## N — Non-functionals

Server components, (app) auth group, no new deps.

## S — Surface

Browser: ranked table with Adj/Δ columns, R² banner, tier badges, reco cards.
