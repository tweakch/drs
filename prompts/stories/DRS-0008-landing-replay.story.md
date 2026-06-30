---
id: DRS-0008
slice: landing-replay
type: story
status: approved
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0002-app-scaffold
---

# DRS-0008 · Landing page race replay

## Story

**As a** visitor arriving at DRS
**I want** the landing page to show an animated track replay (kart numbers only) of the
latest recorded race
**so that** the product immediately shows what it does, with a clear way to sign in.

## Context

Today `/` redirects into the authenticated app. We want a **public landing** at `/` with
an auto-playing, **kart-numbers-only** replay and a **sign-in CTA**. The prototype already
has the replay (`renderReplayView`, `TRACK_PATH`, `getPointAtLength` positioning) and the
official race data (`REAL_RACE`) in `../../wohlen-race-analysis.html` — we port a
simplified version.

No races are persisted yet, so "latest recorded race" is the **embedded** official
28.06.2026 Wohlen race for now, read through a single `getLatestRace()` seam that swaps to
the DB once the persistence/ingest slice lands.

## Acceptance criteria

- [ ] `/` is a **public** page (no auth) showing the replay; signed-in state is not
      required to view it.
- [ ] An auto-playing SVG track replay renders **kart-number markers** moving around the
      track (no driver names, no leaderboard, no controls — just the numbers).
- [ ] Marker position over time is derived from the karts' lap times (cumulative time →
      lap + fraction → point on the track path).
- [ ] A clear **Sign in** call-to-action (→ `/signin`); a secondary link into the app.
- [ ] Data comes via `getLatestRace()` returning the embedded Wohlen race; the seam is
      documented to later return the latest persisted race.
- [ ] The authenticated app is unchanged and still reachable (`/data` etc.).
- [ ] `format/lint/typecheck/test/build` green; `/` builds **without** any DB/secret.

## INVEST check

- **Independent** — depends only on the scaffold; uses embedded data, no backend.
- **Negotiable** — visual fidelity of the track/markers; animation polish.
- **Valuable** — a real first impression + sign-in funnel.
- **Estimable** — yes; port a simplified, self-contained component.
- **Small** — one public page + one replay component + embedded data.
- **Testable** — page renders publicly; pure positioning helper unit-tested; gates green.

## Out of scope

- The full interactive replay (controls, clock, order board, speed/seek) — `/replay` view.
- Real persistence / "latest from DB" (a later slice fills the `getLatestRace()` seam).
- Driver/kart attribution UI, leaderboards, what-if.

## Open questions (resolved)

- Data source → **embedded real race now**, `getLatestRace()` seam for DB later.
- Visibility → **public landing at `/` + sign-in CTA**.
