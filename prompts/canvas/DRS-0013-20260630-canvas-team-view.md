---
id: DRS-0013
slice: team-view
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Team view, ledger T1–T5)
---

# REASONS Canvas — DRS-0013 · Team view (stints)

> Wave 2, Canvas 1. The prototype's Team tab: per-team stint cards with tiers.

## R — Requirements

**Problem.** No view shows the stint breakdown the engine now computes.

**In scope (ledger).** T1 stint cards per team · T2 Ace/Core/Backup tiers · T3
stint stats (best/median/σ/range/duration) · T4 editable driver/kart per stint ·
T5 team-pool verdict tag.

**Out of scope.** The kart-effects decomposition (Driver/Kart, next canvases).

**Definition of done.** `/stints` renders stint cards for every team with tier
colours, stats, editable driver/kart inputs, and a pool verdict. Gates green; browser-verified.

## E — Entities

- Route `app/(app)/stints/page.tsx` (server) → `analyse(taggedDemoRace().raw)`.
- `components/team/StintCards.tsx` (client) — cards + editable tags + verdict.
- Nav: add a "Stints" tab (the RBAC `/team` console is untouched).

## A — Assumptions

- Uses the tagged demo race so driver/kart prefill and rotation are coherent (the
  Wohlen sample has no per-stint tags). Tier comes from `classifyStints` inside `analyse`.

## S — Sequence

1. Server computes `data = analyse(raw)` (stints carry `tier`).
2. `StintCards` renders per team: verdict tag (Ace>Backup → strong; <→ weak; else
   balanced), then a card per stint with tier badge, driver+kart inputs (local
   state, prefilled from tags), median, best/σ/L-range, duration.

## N — Non-functionals

Client component, (app) auth group, no new deps.

## S — Surface

Browser: cards render with tier colours, stats, editable inputs, verdict tags.
