---
id: SHARED
slice: cross-cutting
type: entities
status: approved
created: 2026-06-30
updated: 2026-06-30
---

# E — Entities (shared domain model)

The living glossary for DRS. Every Canvas references this rather than redefining the
domain. When a slice introduces or changes an entity, update this file as part of the
same change (it is the **E** of every REASONS Canvas).

Terms are drawn from the prototype (`../../wohlen-race-analysis.html`) and the sport
(endurance kart racing: teams of rotating drivers running shared karts over a fixed
duration, e.g. the 2-hour GP at Kartbahn Wohlen, 825 m).

---

## Core aggregate: Race

A single timed event. The root aggregate everything hangs off.

| Field      | Type           | Notes                                                       |
| ---------- | -------------- | ---------------------------------------------------------- |
| id         | uuid           |                                                            |
| name       | string         | e.g. "Wohlen 2h GP"                                         |
| track      | Track (embed)  | name, length_m, layout                                      |
| date       | date           | e.g. 2026-06-28                                             |
| format     | enum           | `endurance` (timed) — extensible                           |
| duration_s | int            | race length in seconds (2h = 7200)                          |
| teams      | Team[]         | participants                                                |
| source     | RawTiming      | the ingested dump (Blob) the race was parsed from          |
| is_virtual | bool           | true when derived via what-if edits (see **Virtual mode**) |

## Track

| Field    | Type   | Notes                          |
| -------- | ------ | ------------------------------ |
| name     | string | "Kartbahn Wohlen"              |
| length_m | int    | 825                            |
| layout   | json   | SVG path + apexes for Replay   |

## Team

A competitor entry. Owns an ordered list of laps for the whole race; the engine
**derives** stints from the lap sequence (it is not stored per-lap who drove).

| Field   | Type    | Notes                                                  |
| ------- | ------- | ------------------------------------------------------ |
| id      | uuid    |                                                        |
| race_id | uuid    |                                                        |
| name    | string  | display name                                           |
| color   | string  | palette colour (chart/replay), assigned at parse time  |
| laps    | Lap[]   | full ordered lap sequence                              |
| stints  | Stint[] | **derived** — see splitting rule below                 |

## Lap

| Field    | Type   | Notes                                                            |
| -------- | ------ | --------------------------------------------------------------- |
| index    | int    | 1-based position in the team's sequence                          |
| time_s   | float  | lap time in seconds                                              |
| is_grid  | bool   | standing-start "lap 0": time < 0.5 × racing median; excluded     |
| is_pit   | bool   | driver-change / out-lap: time > 1.35 × racing median             |
| is_out   | bool   | IQR outlier on the slow side (pit/traffic), excluded from stats  |
| is_fast  | bool   | the team's fastest racing lap                                    |
| is_inc   | bool   | incident lap (slow but not a pit stop)                           |

## Stint

A contiguous run between pit stops — conceptually a **(driver × kart) tuple**. This
is the unit the analytics engine reasons about.

| Field    | Type   | Notes                                                       |
| -------- | ------ | --------------------------------------------------------- |
| idx      | int    | 1-based stint number within the team                       |
| start    | int    | first lap index                                            |
| end      | int    | last lap index                                             |
| laps     | Lap[]  | the laps in this stint                                     |
| driver   | Driver | tagged by the user (default `Team · Seat N`)               |
| kart     | Kart   | tagged by the user (kart number)                           |
| best     | float  | fastest lap                                                |
| median   | float  | clean median pace (racing laps only)                       |
| mean     | float  | clean mean                                                 |
| std      | float  | σ over clean laps                                          |
| cov      | float  | coefficient of variation (%) = σ/mean·100                  |
| duration | float  | total seconds on track this stint                          |
| tier     | enum   | `Ace` (≤Q1) · `Core` · `Backup` (≥Q3) of field stint medians |

## Driver

A person. Identified by the name the user tags onto stints; rolls up across the field.

| Field   | Type    | Notes                                                          |
| ------- | ------- | ------------------------------------------------------------- |
| name    | string  | user-tagged                                                    |
| team    | string  | their team                                                     |
| stints  | Stint[] | every stint they drove                                         |
| best    | float   | best lap across their laps                                     |
| median  | float   | median of their clean laps                                     |
| cov     | float   | consistency                                                    |
| deg     | float   | degradation, s/lap                                             |
| adj     | float?  | **kart-adjusted pace** — expected lap in an average kart       |
| tier    | enum    | Ace / Core / Backup, ranked on `adj` when available else median |

## Kart

A physical kart with a hidden, recovered pace rating.

| Field     | Type   | Notes                                                       |
| --------- | ------ | --------------------------------------------------------- |
| number    | string | kart number, e.g. "54"                                     |
| effect    | float  | pace effect vs field mean (negative = faster), centred at 0 |
| stints    | int    | how many stints ran it                                     |
| drivers   | int    | distinct drivers who ran it                                |
| rawMedian | float? | naive median of its laps (before decomposition)            |

---

## Derivations & invariants (the analytics core)

These rules are ported verbatim from the prototype and must be preserved exactly
(they are also referenced from [`safeguards.md`](./safeguards.md)).

- **Time parsing**: `M:SS.mmm` or seconds. `53.4`, `1:02.8` both valid.
- **Outliers** (`cleanLaps`): drop laps outside `[Q1 − 1.5·IQR, Q3 + 1.5·IQR]`.
  Need ≥4 laps to filter.
- **Grid lap**: first lap < 0.5 × racing median → excluded from best & stats.
- **Pit / stint split** (`splitStints`): a lap > 1.35 × racing median ends the
  current stint (if it has ≥3 laps). Threshold sits above worst incident (~+12 s)
  but below a driver-change lap (~79–82 s vs ~53–54 s pace).
- **Degradation**: linear regression slope of clean lap time over lap index, s/lap.
- **Stint tiers**: classify each stint median against the field's Q1 / Q3 of stint
  medians → Ace / Core / Backup.
- **Effects model** (`estimateEffects`): two-way additive decomposition
  `stint_median ≈ grand + kartEffect[kart] + driverEffect[driver]`, solved by
  iterative alternating mean-removal (200 iterations). Kart effects centred to mean 0
  for identifiability; the offset folds into driver effects so driver pace = expected
  lap **in an average kart**. Reports R² (variance explained) and crossover validity
  (`drivers + karts ≤ observations`). Requires each stint tagged with **both** a
  driver and a kart, with enough kart-sharing crossover to be identifiable.
- **Ranking**: race result ranks by laps completed, then total time; a what-if uses
  virtual total over equal lap counts.

## Virtual mode (what-if)

Editing any lap, driver tag, or kart tag — or dropping each team's slowest *N* laps —
produces a **derived virtual race** (`is_virtual = true`) recomputed from the edits.
Resetting in the Data view returns to the official result. Virtual races are never
persisted over the canonical race; they are session/derived state.

---

## Views (UI surfaces over the model)

Nine read/edit surfaces from the prototype, each a future slice:

| View       | Purpose                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| Data       | Lap-data intake (paste/CSV), parse, the raw lap table.                    |
| Director   | Pre-race setup: teams, karts, driver line-ups, quick-paste roster.       |
| Product    | Go-live tracker: tasks/status, milestones with dates, checklists.        |
| Race       | Overall result: positions, gaps, KPIs, pace chart.                       |
| Team       | Per-team breakdown: stints, consistency, degradation.                    |
| Driver     | Driver leaderboard, kart-adjusted pace, recommendations.                 |
| Kart       | Recovered kart pace ratings (the hidden effect).                         |
| Detektiv   | Kart-identity puzzle: infer which kart is which from pace.                |
| Replay     | Animated SVG track playback: positions, clock, order, speed/seek.        |
