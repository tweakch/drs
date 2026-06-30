---
id: DRS-0007
slice: driver-role
type: canvas
status: implemented
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0007-driver-role.story.md
source_analysis: ../analysis/DRS-0004-20260630-analysis-role-layer.md
depends_on: DRS-0003-auth-foundation
---

# REASONS Canvas — DRS-0007 · Driver role

## R — Requirements

A Driver sees their own, self-scoped surface and can edit their profile. **DoD:** a Driver
sees only their own data (others → 404), can **edit their display name**, has no write
paths into race data/roster; gates green with no DB. Personal metrics deferred (engine
stubbed) per the story sequencing note.

## E — Entities

`User`, `Membership`, domain `Driver` ([entities](../shared/entities.md)).

## A — Approach

Replace the `/driver` placeholder with a self-scoped dashboard. `requireRole('Driver')`;
all data keyed to the signed-in user's own membership. Read-mostly; the only write is the
user's own display name. Current event only; metrics are a placeholder until the engine.

## S — Structure

```
app/(app)/driver/page.tsx         ← own profile + (placeholder) personal metrics panel
app/(app)/driver/actions.ts       ← updateDisplayName(name)
lib/db/queries.ts                 ← (EXTEND) getDriverSelf
components/driver/ProfileForm.tsx
```

## O — Operations

1. **Guard + self scope.** `/driver` resolves the caller's own Driver membership; foreign
   driver id → 404.
   - _Accept:_ a Driver can only ever load their own data.
2. **Profile.** Show display name + team/event; placeholder metrics panel with a clear
   "available once results are published / engine slice" note.
   - _Accept:_ renders self-scoped; no other drivers' data reachable.
3. **Edit name.** `updateDisplayName` updates only the caller's own user row.
   - _Accept:_ cannot edit anyone else; no race-data write paths exist.
4. **Verify.** gates green with no DB.

## N / S — deltas

Inherit. Self-only isolation; no write paths beyond own profile. Driver eventually sees own
numbers + anonymized rank vs field (when the engine lands).

## Changelog

- 2026-06-30 — created (role layer); forum/ADR-0006. Approved.
- 2026-06-30 — **implemented** via `spdd-generate`; `/driver` console live (own profile +
  edit name; metrics placeholder), self-scoped, gates green.
