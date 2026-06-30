# Prototype → App Port Ledger

Tracks the port of `wohlen-race-analysis.html` features into the Next.js app. The
goal: **≥ 80 % of features landed** (`✅`). Status: `✅` landed · `🟡` partial · `⬜` not started.

**Count:** 60 features · target 48 (80 %).

_Updated each wave. See `prompts/canvas/` for the REASONS Canvas behind each view._

## Wave order

1. Analytics engine (keystone) → **Data**, **Race**
2. **Team**, **Driver**, **Kart**
3. **Detektiv**, **Replay** (controls)
4. **Director sim** / **Product** (only if needed for 80 %)

## Ledger

### Data (8)

- ✅ D1 — paste freeform intake (`Name: t, t, …`)
- ✅ D2 — CSV intake (`Kart,Lap,Time`)
- ✅ D3 — load sample / seeded race
- ✅ D4 — synthetic demo generator
- ✅ D5 — editable lap grid
- ✅ D6 — driver tagging (per stint)
- ✅ D7 — kart tagging (per stint)
- ✅ D8 — pit-lap dimming

### Race (12)

- ✅ R1 — KPI: teams
- ✅ R2 — KPI: total laps
- ✅ R3 — KPI: field best (Δ vs track PB)
- ✅ R4 — KPI: avg CoV
- ✅ R5 — classification table
- ✅ R6 — column sorting
- ✅ R7 — gap-to-leader column
- ✅ R8 — pace-trace line chart
- ✅ R9 — chart legend toggle
- ✅ R10 — pace-vs-consistency scatter
- ✅ R11 — best-vs-median bars
- ✅ R12 — key-findings insights panel

### Team (5)

- ✅ T1 — stint cards per team
- ✅ T2 — Ace/Core/Backup tiers
- ✅ T3 — stint stats (best/median/σ/range/duration)
- ✅ T4 — editable driver/kart on a stint
- ✅ T5 — team-pool verdict tag

### Driver (6)

- ✅ V1 — driver leaderboard table
- ✅ V2 — kart-adjusted pace column
- ✅ V3 — kart-Δ (luck) column
- ✅ V4 — model-quality banner (R²)
- ✅ V5 — tier classification
- ✅ V6 — lineup recommendations

### Kart (4)

- ✅ K1 — kart pace ratings table
- ✅ K2 — pace-effect vs fastest bars
- ✅ K3 — usage stats (stints / drivers)
- ✅ K4 — empty-state gating

### Detektiv (6)

- ⬜ X1 — confidence meter
- ⬜ X2 — kart pool display
- ⬜ X3 — stint grid (team × stint)
- ⬜ X4 — candidate-set display
- ⬜ X5 — fact dropdown (constraint entry)
- ⬜ X6 — constraint solver

### Replay (9)

- ✅ P1 — track SVG + kart markers _(landing/sign-in)_
- ✅ P2 — live timing tower (pos/kart/lap/gap)
- ✅ P3 — speed control (1–12×)
- ✅ P4 — label modes (team/driver/kart)
- ✅ P5 — gap modes (leader/ahead)
- ✅ P6 — play/pause
- ✅ P7 — seek slider
- ⬜ P8 — apex markers
- ⬜ P9 — racing line / pit-lane animation

### Director sim (5)

- ⬜ G1 — kart pool/box config
- ⬜ G2 — teams table editor
- ⬜ G3 — quick-entry parser
- ⬜ G4 — config validation
- ⬜ G5 — Monte-Carlo simulator

### Product (5)

- ⬜ PR1 — progress summary
- ⬜ PR2 — stakeholder CRUD
- ⬜ PR3 — milestone roadmap
- ⬜ PR4 — launch checklist
- ⬜ PR5 — localStorage persistence

## Tally

- Landed: **42 / 60** (70 %)
