---
id: DRS-0012
slice: data-view
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Data view, ledger D1–D8)
---

# REASONS Canvas — DRS-0012 · Data view

> Wave 1, Canvas 3. The intake front door: paste/CSV/sample/demo → editable lap
> grid + driver/kart tagging, with an inline analysis preview.

---

## R — Requirements

**Problem.** `/data` is a stub. Port the prototype's Data view: load lap data,
edit it, tag drivers/karts per stint.

**In scope (ledger).** D1 paste freeform · D2 CSV · D3 load sample race · D4
synthetic demo generator · D5 editable lap grid · D6 driver tagging · D7 kart
tagging · D8 pit-lap dimming. Plus an inline mini-classification so intake is verifiable.

**Out of scope.** Cross-view shared state (paste-here-see-in-Race) — a later store
slice; virtual/what-if editing; the full Director simulator (Wave 4).

**Definition of done.**

- [ ] Paste or CSV → parsed via `parseInput`; "Load sample" and "Demo" populate too.
- [ ] Per-team editable lap grid; pit laps (>1.35× racing median) dimmed.
- [ ] Per-stint driver + kart inputs (tags held in client state).
- [ ] Inline classification preview from `analyse`. Gates green; browser-verified.

---

## E — Entities

- `components/data/DataView.tsx` (client) — owns text, parsed `RawLaps`, `Tags`.
- `lib/analytics/demo.ts` — `generateDemoRace(nTeams)` deterministic-enough synthetic laps.
- Page passes the sample race's `RawLaps` + kart numbers as initial props.

---

## A — Assumptions

- Engine is pure → the Data view computes `parseInput`/`splitStints`/`analyse`
  client-side. `Math.random` only inside the Demo click handler (never in render).
- Editable grid shows one selected team at a time (keeps the DOM light vs 15×140 inputs).

---

## S — Sequence

1. Textarea + buttons: Analyse (`parseInput`), Load sample, Demo, Clear.
2. On parse → team list; select a team → editable lap grid (D5) with pit-lap
   dimming (D8); below it the team's stints with driver/kart inputs (D6/D7).
3. Inline classification table from `analyse(parsed)` (pos/team/laps/best/median/gap).

---

## O — Operations contracts

- Editing a lap cell updates `parsed` immutably and re-derives the preview.
- Tags keyed `team → stintIndex`; passed to the engine where relevant.

---

## N — Non-functionals

- Client component in the (app) auth group. No new deps.

---

## S — Surface

- Unit: `generateDemoRace` shape (n teams, plausible lap counts/values).
- Browser: paste parses; sample loads; grid edits; pit laps dim; tags persist.
