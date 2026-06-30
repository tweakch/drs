---
id: DRS-0016
slice: replay-controls
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: (porting goal — Replay controls, ledger P4–P7)
---

# REASONS Canvas — DRS-0016 · Replay controls

> Wave 3, Canvas 1. Promotes the looping replay into a full `/replay` view with
> broadcast controls.

## R — Requirements

**In scope (ledger).** P4 label modes (team/driver/kart) · P5 gap modes
(leader/ahead) · P6 play/pause · P7 seek slider. (P1–P3 already shipped.)

**Out of scope.** P8 apex markers · P9 racing line / pit-lane animation (deferred).

**Definition of done.** `/replay` plays the sample race with play/pause, a seek
slider, a label-mode switch, and a gap-mode switch wired to the tower. Gates green;
browser-verified.

## E — Entities

- Route `app/(app)/replay/page.tsx` (server) → sample race.
- `components/replay/ReplayStage.tsx` (client) — controlled timeline + controls.
- Extend `ReplayLeaderboard` with a `gapMode` prop ('ahead' default | 'leader').

## A — Assumptions

- Timeline period = **min** team total time, so no kart wraps within `[0, period)`
  (positionAt stays in range; tower + markers stay coherent).
- Marker = dot + adjacent label; label text switches by mode (kart # / team name /
  current seat). Driver seat derived from pit-lap boundaries.
- Reuses `positionAt` + `standingsAt`; respects `prefers-reduced-motion` (static frame).

## S — Sequence

1. State: `raceTime`, `playing`, `speed`, `labelMode`, `gapMode`.
2. RAF advances `raceTime` while playing; loops at `period`. Seek sets it; pause stops.
3. Markers placed via `positionAt`; tower via `standingsAt(...)` → `ReplayLeaderboard gapMode`.
4. Controls row: play/pause · seek · speed · label-mode buttons · gap-mode buttons.

## N — Non-functionals

Client component, (app) auth group, no new deps.

## S — Surface

Browser: play advances time; pause stops; seek scrubs; label switch changes marker
text; gap switch flips tower column.
