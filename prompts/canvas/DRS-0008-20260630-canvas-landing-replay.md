---
id: DRS-0008
slice: landing-replay
type: canvas
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0008-landing-replay.story.md
source_analysis: ../analysis/DRS-0008-20260630-analysis-landing-replay.md
depends_on: DRS-0002-app-scaffold
---

# REASONS Canvas — DRS-0008 · Landing page race replay

## R — Requirements

Public `/` landing with an auto-playing, **kart-numbers-only** track replay of the latest
race + a sign-in CTA. **DoD:** `/` is public and static (no `auth()`/DB), renders moving
kart-number markers driven by lap times, links to `/signin`; the authed app is unchanged;
all gates green; `/` builds with no DB/secret.

## E — Entities

Uses the race domain ([`../shared/entities.md`](../shared/entities.md)): `Race`/`Team`/`Lap`
with kart numbers. Read via a `getLatestRace()` seam (embedded now → DB later). No deltas.

## A — Approach

Port a **simplified** replay from the prototype (`REAL_RACE` ~L2356, `TRACK_PATH` L1372,
`getPointAtLength` positioning ~L1483). Keep the time→fraction math **pure/testable**; do
the DOM path mapping in a client component (RAF loop). `/` is a static public page (root
layout only); the `(app)` group keeps gating the nine views. Respect
`prefers-reduced-motion`.

## S — Structure

```
app/page.tsx                          ← NEW public landing (root layout; static; no auth())
app/(app)/page.tsx                    ← REMOVE (old "/"→/data redirect; conflicts with above)
lib/race/sample-race.ts               ← embedded official Wohlen race (ported REAL_RACE) + TRACK_PATH
lib/race/latest.ts                    ← getLatestRace(): returns embedded race (DB seam, documented)
lib/race/replay-position.ts           ← pure: positionAt(laps, t) -> {lap, frac, elapsed}
lib/race/replay-position.test.ts      ← unit tests for the positioning math
components/replay/LandingReplay.tsx    ← "use client": SVG TRACK_PATH + RAF + number markers
components/landing/Hero.tsx           ← header/eyebrow + tagline + Sign in CTA
```

No new deps (uses React + the existing Tailwind tokens).

## O — Operations

1. **Public routing.** Add `app/page.tsx`; delete `app/(app)/page.tsx`. `/` renders with
   the root layout only (public). Do not call `auth()` in `/`.
   - _Accept:_ `/` returns 200 unauthenticated; `/data` still gated; no route conflict.
2. **Embedded data + seam.** `lib/race/sample-race.ts` ports `REAL_RACE` (kart numbers) and
   `TRACK_PATH`. `lib/race/latest.ts` `getLatestRace()` returns it; comment marks the DB
   swap point.
   - _Accept:_ typed race object with per-kart lap arrays + kart number; `TRACK_PATH` reused.
3. **Pure positioning.** `replay-position.ts`: from a kart's lap times and elapsed `t`
   (looping the total), compute current lap + fraction within it (linear by lap time).
   - _Accept:_ unit tests: t=0 → frac 0; mid-lap interpolation; wraps past total.
4. **Replay component.** `LandingReplay` (client): render `TRACK_PATH`; one marker per kart
   labelled with its **number**; a single RAF loop advances `t` and sets each marker to
   `path.getPointAtLength(frac × length)`. No controls/clock/leaderboard. Reduced-motion →
   static first frame.
   - _Accept:_ markers animate around the track; numbers visible; no driver names.
5. **Landing composition.** `app/page.tsx` = `Hero` (title + "Sign in" → `/signin`, plus a
   secondary "Enter app" → `/data`) + `LandingReplay` using `getLatestRace()`.
   - _Accept:_ visually on-brand (asphalt/paint/hot tokens); CTA works.
6. **Verify.** format/lint/typecheck/test/build green; `/` static, no DB.

## N — Norms (deltas)

Inherit [`../shared/norms.md`](../shared/norms.md). Keep positioning math framework-free
and tested; client component only for DOM/RAF. Tokens via Tailwind theme.

## S — Safeguards (deltas)

Inherit [`../shared/safeguards.md`](../shared/safeguards.md). `/` must stay public, static,
and DB-free (no `auth()`); embedded race is public sample data. Replay is read-only.

## Changelog

- 2026-06-30 — created; data source = embedded real race (DB seam for later); public
  landing + sign-in CTA. Approved.
