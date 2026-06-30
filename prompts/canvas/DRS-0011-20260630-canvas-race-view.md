---
id: DRS-0011
slice: race-view
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Race view, ledger R1–R12)
---

# REASONS Canvas — DRS-0011 · Race view

> Wave 1, Canvas 2. Lights up `/race` with the prototype's classification +
> charts + insights, computed by the DRS-0010 engine on the sample race.

---

## R — Requirements

**Problem.** `/race` is an `EmptyState` stub. The engine now exists; render the
prototype's Race view: KPIs, sortable classification table, two charts, insights.

**In scope (ledger).** R1–R4 KPI cards · R5 classification table · R6 column
sorting · R7 gap column · R8 pace-trace line chart · R9 chart legend toggle ·
R10 pace-vs-consistency scatter · R11 best-vs-median bars · R12 insights panel.

**Out of scope.** Editing/virtual mode, paste intake (Data view, Canvas 3), Driver/Kart tabs.

**Definition of done.**

- [ ] `/race` renders all of R1–R12 from `analyse(raceToRawLaps(getLatestRace()))`.
- [ ] Table sorts on every column; charts render via Chart.js; insights read as prose.
- [ ] `format/lint/typecheck/test/build` green; verified in a browser.

---

## E — Entities

- Input: `TeamAnalysis[]` + `Insight[]` from the engine (server-computed).
- `components/race/`: `Kpis`, `ClassificationTable` (client), `PaceTrace` (client),
  `PaceConsistency` (client), `Insights`.

---

## A — Assumptions

- Data source is the embedded sample race via `getLatestRace()` (DB-free, static-safe),
  same seam the landing replay uses; later swaps to a DB race with no view change.
- Charts use `chart.js/auto` (already a dependency) in client components; Chart.js's
  interactive legend provides the per-team toggle (R9) plus all/none buttons.
- The grid-crossing lap 0 is excluded from the pace-trace x-axis (engine flags `hasGridLap`).

---

## S — Sequence

1. `page.tsx` (server): compute `data = analyse(raceToRawLaps(race))`, `insights`.
2. `Kpis` — teams, total laps, field best (+Δ vs `TRACK_PB`), avg CoV.
3. `ClassificationTable` (client) — sortable; columns Pos, Team, Laps, Best,
   Median, Mean·clean, σ, CoV%, Deg, Gap. P1 + fastest-lap highlight.
4. `PaceTrace` (client) — one line per team over racing laps; Chart.js legend toggle.
5. `PaceConsistency` (client) — scatter (median vs σ) + bars (best vs median).
6. `Insights` — compose narrative from `Insight[]` (`mark`, `subject`, `metric`).

---

## O — Operations contracts

- Server computes; client components receive plain serialisable props.
- Charts created in `useEffect`, destroyed on cleanup; respect container width.
- Sorting is pure UI state; default sort = position ascending.

---

## N — Non-functionals

- `/race` stays in the (app) auth group. No new deps. Charts lazy on the client only.

---

## S — Surface

- Unit: a small `kpis` summary helper test (teams/laps/fieldBest/avgCoV) if extracted.
- Browser: KPIs populate, table sorts, both charts paint, insights list.
