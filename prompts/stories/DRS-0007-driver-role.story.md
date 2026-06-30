---
id: DRS-0007
slice: driver-role
type: story
status: draft
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0003-auth-foundation
---

# DRS-0007 · Driver role

## Story

**As a** Driver
**I want** to see my own performance — my stints, pace, consistency, degradation,
kart-adjusted rating, and where I stand — across the events I've raced
**so that** I can review my driving and improve, without touching anyone else's data.

## Context

A `Driver` membership links a user to one domain **Driver** within a **Team** (and event).
Drivers are invited by their Team manager and have a **read-mostly, self-only** view. Maps
to the prototype's per-driver stats (own stints, kart-adjusted pace from the effects
model). Built on [DRS-0003](./DRS-0003-auth-foundation.story.md); the underlying metrics
come from later data/engine slices — see sequencing note.

## Acceptance criteria

- [ ] Accept a Team's driver invitation → gain a `Driver` membership scoped to that team +
      event.
- [ ] Personal dashboard: own stints, best/median pace, consistency (σ / CoV),
      degradation, kart-adjusted pace, and leaderboard position — **for the signed-in
      driver only**, across the events they raced.
- [ ] Edit own profile (display name); no roster, tagging, or race-data edit rights.
- [ ] Cannot see other drivers' or teams' private data (cross-tenant → 404), enforced
      server-side.

## Sequencing note

The metrics shown are produced by the analytics engine (stubbed today) and need the
data-ingest slice. This story owns the **Driver's access, self-scoping, and dashboard
shell**; the metric content is wired as the engine/data slices land.

## INVEST check

- **Independent** — depends on DRS-0003; metrics arrive separately.
- **Negotiable** — how much is shown before the engine exists (shell vs. live metrics).
- **Valuable** — gives the individual racer a reason to log in.
- **Estimable** — yes for access + self-scoped shell.
- **Small** — read-mostly, self only.
- **Testable** — self-only isolation, profile edit, no write paths verified.

## Out of scope

- Tagging / roster (Team role); event setup (Director); any cross-driver visibility.
- Editing race data or stints.

## Open questions (resolve at clarify gate)

- Should a Driver see their **rank vs. teammates / the field**, or only their own numbers
  (privacy)?
- Cross-event history now, or only the current event initially?
- Can a Driver belong to **multiple teams** (across events) under one login?
