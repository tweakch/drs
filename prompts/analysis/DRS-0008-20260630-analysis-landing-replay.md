---
id: DRS-0008
slice: landing-replay
type: analysis
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0008-landing-replay.story.md
---

# Analysis — DRS-0008 · Landing page race replay

## Prototype references (source of truth)

`../../wohlen-race-analysis.html`:

- **`REAL_RACE`** (~L2356): the official race object — per team `{ laps: number[], kart }`.
  Port verbatim into an embedded data module (kart numbers come from `.kart`).
- **`TRACK_PATH`** (L1372): the SVG path `d` for the Kartbahn Wohlen layout. Reuse it.
- **`renderReplayView`** (~L1413) + **`getPointAtLength`** positioning (~L1483, L1517): the
  technique — sample the path, place a marker at the fraction of the lap a kart has
  completed at time `t`. Port the math, drop the chrome (clock, order board, controls).

## Approach (simple)

- **Routing:** make `/` public. Remove `app/(app)/page.tsx` (the redirect); add
  `app/page.tsx` (root layout only → public, no auth). The `(app)` group keeps gating the
  nine views (`/data`, …). Keep `/` **static** — do NOT call `auth()` there, so it builds
  and serves with no DB.
- **Data seam:** `lib/race/latest.ts` → `getLatestRace()` returns the embedded Wohlen race
  now; documented to return the latest persisted race later. Keep the embedded race data in
  `lib/race/sample-race.ts`.
- **Replay component:** a client component `components/replay/LandingReplay.tsx` —
  auto-plays, loops, renders one number-marker per kart along the `TRACK_PATH`. Positioning
  via a **pure helper** (`lib/race/replay-position.ts`: cumulative lap times → `{lap,
frac}` at elapsed `t`) so it's unit-testable; the component maps `frac` → path point with
  `getPointAtLength` in an effect/RAF loop.
- **Kart numbers only:** markers show the kart number; no names/leaderboard/controls.

## Risks & unknowns

- **Path point mapping needs the DOM** (`getPointAtLength`) — keep that in the client
  component; keep the time→fraction math pure (testable, SSR-safe).
- **Animation perf:** a handful of karts; use one RAF loop, transform markers. Respect
  `prefers-reduced-motion` (render a static frame).
- **Routing conflict:** `app/page.tsx` and `app/(app)/page.tsx` both resolve to `/` —
  the old one must be removed.
- Keep `/` free of `auth()`/DB so it stays static and public.

## Suggested Operations outline

1. Public routing: add `app/page.tsx`, remove `(app)/page.tsx`.
2. Embedded data + seam: `sample-race.ts` (ported `REAL_RACE`), `getLatestRace()`.
3. Pure positioning helper + unit test.
4. `LandingReplay` client component (SVG `TRACK_PATH`, RAF, number markers, reduced-motion).
5. Landing page composition: header + replay + sign-in CTA.
6. Verify gates green; `/` static, no DB.
