---
id: DRS-0010
slice: analytics-engine
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — wohlen-race-analysis.html golden-master)
---

# REASONS Canvas — DRS-0010 · Analytics engine (golden-master port)

> Wave 1, keystone. Ports the prototype's pure analytical core into
> `lib/analytics`, replacing the `NOT_IMPLEMENTED` stubs. Every dead view
> (Data, Race, Team, Driver, Kart, Detektiv) depends on this.

---

## R — Requirements

**Problem.** `lib/analytics/engine.ts` is signatures-only — every body throws. The
prototype's lap maths (`wohlen-race-analysis.html`) is the only implementation. Port
it faithfully and prove parity with golden-master tests so the views can light up.

**In scope.** Pure, DOM-free functions on `RawLaps` (`Record<name, number[]>`):
`parseInput`, `cleanLaps`, `degradation`, `splitStints`, `classifyStints`,
`estimateEffects`, `driverLeaderboard`, `kartLeaderboard`, `analyse`, `buildInsights`,
`lineupRecos`, plus stats helpers and a `Race → RawLaps` adapter.

**Out of scope.** UI, charts, the Detektiv solver (Wave 3), virtual/what-if editing.

**Definition of done.**

- [ ] No function throws `NOT_IMPLEMENTED`; signatures typed.
- [ ] Golden-master test: engine output on the sample Wohlen race matches values
      captured from the prototype's own functions (best/median/σ/CoV/deg/pos/gap,
      stint splits, effects, leaderboards).
- [ ] `format/lint/typecheck/test/build` green.

---

## E — Entities

- `RawLaps = Record<string, number[]>` — team name → ordered lap times (lap 0 = grid).
- `Tags = { drivers: Record<string,string[]>, karts: Record<string,string[]> }` — per
  team, per stint index. Passed in (no globals).
- `Stint`, `TeamAnalysis`, `EffectsModel`, `DriverRow`, `KartRow`, `Insight`, `Reco`
  in `lib/analytics/types.ts` (extend existing).

---

## A — Assumptions

- Lap 0 is a standing-start grid crossing when `laps[0] < racingMedian * 0.5`.
- Pit/out lap when `lap > racingMedian * 1.35` and current stint ≥ 3 laps.
- Outliers via IQR fence (`q3 + 1.5·IQR`, `q1 − 1.5·IQR`) on the slow side.
- `PAL` 10-colour rotation, ported verbatim, assigns team colours by index.
- Effects model: 200 iterations alternating mean-removal; kart effects centred to 0.

---

## S — Sequence (operations, in order)

1. Stats helpers `mean/median/std/quartiles` — verbatim.
2. `parseTime` + `parseInput` — CSV detection then `Name: t,t` freeform.
3. `cleanLaps`, `degradation` — verbatim.
4. `splitStints` (grid-lap drop, pit threshold) → typed `Stint[]`.
5. `classifyStints` — Ace/Core/Backup by field stint-median quartiles.
6. `estimateEffects` → `EffectsModel` (grand, driverEffect, kartEffect, r2, nObs, crossover).
7. `driverLeaderboard`, `kartLeaderboard` — roll stints up; rank kart-adjusted or raw.
8. `analyse` — per team stats + positions + gaps; `classifyStints` over the field.
9. `buildInsights`, `lineupRecos` — structured (no HTML; return data, render in view).
10. `raceToRawLaps(race)` adapter + `tagsFromRace(race)` (kart # from sample data).

---

## O — Operations contracts

- All functions **pure**; tags passed as params, never module globals.
- `analyse(raw, tags?, dropSlowest=0): TeamAnalysis[]` sorted by position.
- Insights/recos return `{ mark, text }[]` (data, not markup).
- Numeric parity with the prototype within 1e-9 on shared inputs.

---

## N — Non-functionals

- Zero deps, no DOM/React. Runs in the Node test worker and in RSC.
- Deterministic (no `Date`/`random`).

---

## S — Surface (tests)

- `engine.test.ts`: golden-master constants captured from the prototype run on the
  sample race + unit cases (grid-lap drop, IQR, pit split, effects centring).
