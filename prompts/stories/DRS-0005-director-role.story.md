---
id: DRS-0005
slice: director-role
type: story
status: draft
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0003-auth-foundation
related: [DRS-0002-app-scaffold]
---

# DRS-0005 · Director role

## Story

**As a** Director (race organiser)
**I want** to create and run my own events — set them up, ingest the official timing,
manage the field, invite the participating Teams, and publish results
**so that** I can deliver an event's after-action review to its teams and drivers.

## Context

A Director **owns events** (the tenant boundary) and runs them end to end. This maps to
the prototype's **Director view** (race/field setup). Directors are invited by an Admin
and only ever see/act on **their own** events. Built on
[DRS-0003](./DRS-0003-auth-foundation.story.md); the Director view shell exists from
[DRS-0002](./DRS-0002-app-scaffold.story.md). Some capabilities depend on later
data/engine slices — see sequencing note.

## Acceptance criteria

- [ ] Create / edit / archive an **Event** (owned by the Director); lifecycle
      `draft → live → published → archived`.
- [ ] Event access is scoped to the owner server-side: a Director cannot see or touch
      another Director's event (404).
- [ ] Field setup (Director view): manage the event's teams, karts, and driver line-ups.
- [ ] Invite **Team** managers to the event (DRS-0003 invitation flow); see/revoke pending
      team invitations.
- [ ] Ingest the official race timing for the event (the canonical race is immutable once
      ingested; only the owning Director may ingest/replace it).
- [ ] Publish results → makes the agreed overall results visible to that event's teams and
      drivers.
- [ ] Director sees all teams' data **within their own event**.

## Sequencing note

The **race-data ingest + analysis engine** are separate slices (the `lib/analytics`
bodies are stubbed today). This story delivers the Director's **access, event lifecycle,
field setup, and invitations**; the ingest/analysis actions are wired to real behaviour as
those slices land. It is shippable as the event control-plane before then.

## INVEST check

- **Independent** — depends on DRS-0003 (auth); analytics arrive separately.
- **Negotiable** — how rich field setup is before the engine exists.
- **Valuable** — Directors are how events come into being.
- **Estimable** — yes for the control-plane portion.
- **Small** — one role's event ownership + setup + invites.
- **Testable** — ownership isolation, lifecycle transitions, team invites verified.

## Out of scope

- Cross-event / cross-director access (Admin only).
- Implementing the analytics engine bodies / the ingest parser (data slices).
- Team-internal roster and tagging (Team role).

## Open questions (resolve at clarify gate)

- Can an event have **co-directors** (multiple owners), or strictly one?
- What exactly does "publish" expose to teams vs. keep private (results only, or full
  per-team analysis)?
- Can a Director self-serve (create their first event) or must an Admin pre-create it?
