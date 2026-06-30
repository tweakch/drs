---
id: DRS-0017
slice: detektiv-view
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Detektiv view, ledger X1–X6)
---

# REASONS Canvas — DRS-0017 · Detektiv (kart constraint solver)

> Wave 3, Canvas 2 — reaches the 80% goal. The prototype's hardest feature: infer
> which physical kart each team drove per stint from grid karts + pit timing.

## R — Requirements

**In scope (ledger).** X1 confidence meter · X2 kart pool display · X3 stint grid
(team × stint) · X4 candidate-set display · X5 fact dropdown (constraint entry) ·
X6 constraint solver.

**Out of scope.** Ground-truth scoring badges; the Monte-Carlo simulator (Director).

**Definition of done.** `/detektiv` shows the solved grid with confidence, lets the
user pin a kart on an ambiguous stint to re-solve, and lists the pool. Gates green;
browser-verified; solver unit-tested.

## E — Entities

- `lib/analytics/detektiv.ts` — pure `derivePitEvents`, `kartPool`, `solveKarts`
  (prototype globals → params). Unit-tested.
- `lib/race/demo-tagged.ts` — `detektivScenario()` (4 teams + 3 box karts).
- Route `app/(app)/detektiv/page.tsx` (server) → analyse + scenario.
- `components/detektiv/DetektivBoard.tsx` (client) — facts state, re-solve, grid.

## A — Assumptions

- Solver is pure → runs client-side on each fact change. Stint 0 is always the grid
  kart (resolved). The scenario's spare box karts give the solver room to prune.

## S — Sequence

1. Server passes `data`, `teamNos`, `boxStart`.
2. `DetektivBoard` holds `facts`; computes `solveKarts(data, {teamNos, boxStart, facts})`.
3. Render: confidence meter (X1), pool (X2), grid rows×stints (X3) with candidate
   sets (X4) and a pin-dropdown on ambiguous cells (X5); a Clear-facts button.

## N — Non-functionals

Client component, (app) auth group, no new deps.

## S — Surface

Unit: solver (events/pool/grid-resolution/fact-pinning). Browser: grid + confidence
render; pinning a fact narrows a cell and lifts confidence.
