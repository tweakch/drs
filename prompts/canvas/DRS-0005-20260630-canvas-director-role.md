---
id: DRS-0005
slice: director-role
type: canvas
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0005-director-role.story.md
source_analysis: ../analysis/DRS-0004-20260630-analysis-role-layer.md
depends_on: DRS-0003-auth-foundation
---

# REASONS Canvas — DRS-0005 · Director role

## R — Requirements

Directors own and run their events. **DoD:** a Director sees only their own events, can
**create** an event, **invite a Team** to it, and move status `draft→live→published`;
another Director's event → 404; gates green with no DB. Race ingest/analysis deferred
(data/engine slices) per the story sequencing note.

## E — Entities

`Event`, `Membership`, `Invitation`, domain `Team` ([entities](../shared/entities.md)).

## A — Approach

Replace the `/director` placeholder with an owner-scoped event console. `requireRole`

- ownership check via `requireScope`. Self-serve event creation (invite-only already gates
  who is a Director). Invite-Team reuses invitations. One owner per event.

## S — Structure

```
app/(app)/director/page.tsx       ← own events list + create form + per-event actions
app/(app)/director/actions.ts     ← createEvent, inviteTeam(eventId,email), setEventStatus
lib/db/queries.ts                 ← (EXTEND) listEventsOwnedBy, createEvent, setEventStatus
components/director/EventList.tsx, CreateEventForm.tsx
```

## O — Operations

1. **Guard + own scope.** `/director` → `requireRole('Director')`; queries filter by owner.
   - _Accept:_ cannot see another Director's events (404 on direct access).
2. **Create event.** `createEvent` server action (owner = caller).
   - _Accept:_ event created with `status:'draft'`, owned by caller.
3. **Invite Team / set status.** `inviteTeam` → `createInvitation({role:'Team',eventId})`;
   `setEventStatus` transitions draft→live→published (owner only).
   - _Accept:_ team invite scoped to the event; status transitions guarded.
4. **Verify.** gates green with no DB.

## N / S — deltas

Inherit. Only the owning Director may ingest/replace the canonical race (enforced when the
ingest slice lands). Event access is an authz boundary.

## Changelog

- 2026-06-30 — created (role layer); forum/ADR-0006. Approved.
