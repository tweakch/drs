---
id: DRS-0006
slice: team-role
type: story
status: draft
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0003-auth-foundation
---

# DRS-0006 · Team role

## Story

**As a** Team manager
**I want** to manage my team within an event — accept the Director's invite, build my
roster, invite my drivers, tag who drove which kart on each stint, and view my team's
analysis and what-if scenarios
**so that** my team gets its own after-action review, isolated from other teams.

## Context

A `Team` membership links a user to one domain **Team** (competitor entry) within an
**Event**. Teams are invited by the event's Director and see **only their own** team's
data (plus published overall results). Maps to the prototype's Team / Driver / Kart views
scoped to one team, and the stint driver/kart tagging. Built on
[DRS-0003](./DRS-0003-auth-foundation.story.md). Analysis-rich capabilities depend on the
data/engine slices — see sequencing note.

## Acceptance criteria

- [ ] Accept a Director's team invitation → gain a `Team` membership scoped to that event +
      team.
- [ ] Roster management: invite / remove **Drivers** on the team (DRS-0003 invitations);
      see pending invites.
- [ ] Tag stints with driver × kart for **own team only**; tags persist and are editable
      only within the team's scope.
- [ ] View own team's analysis (Team / Driver / Kart views) and run **what-if** — all
      scoped to the team.
- [ ] See published overall results, but **not** other teams' private per-team detail
      (cross-tenant access → 404), enforced server-side.

## Sequencing note

Stint tagging persistence and the analysis views depend on the data-ingest, engine, and
tag-persistence slices (today the engine is stubbed and tags aren't persisted). This story
owns the **Team's access, roster/driver invitations, and the scoping rules**; the
analysis/tagging capabilities are wired as those slices land.

## INVEST check

- **Independent** — depends on DRS-0003; analytics arrive separately.
- **Negotiable** — how much analysis is available pre-engine.
- **Valuable** — teams are the primary consumers of the review.
- **Estimable** — yes for access + roster + scoping.
- **Small** — one team's scope; no event setup, no other teams.
- **Testable** — isolation (no other-team data), driver invites, tag scope verified.

## Out of scope

- Event setup / ingest (Director role).
- Other teams' private data; cross-event access.
- Implementing the engine bodies.

## Open questions (resolve at clarify gate)

- Can a team have **multiple managers**, or one per team?
- May a Team manager also be a Driver on the same team (dual membership)?
- Are driver/kart tags visible to the Director and other teams, or strictly private until
  published?
