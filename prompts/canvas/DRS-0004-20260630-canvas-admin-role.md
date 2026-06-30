---
id: DRS-0004
slice: admin-role
type: canvas
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0004-admin-role.story.md
source_analysis: ../analysis/DRS-0004-20260630-analysis-role-layer.md
depends_on: DRS-0003-auth-foundation
---

# REASONS Canvas — DRS-0004 · Admin role

## R — Requirements

Platform-admin-only control surface. **DoD:** non-admins get 404 at `/admin` (server
check); admin can see users + all events + pending invites and **invite a Director**;
gates stay green with no DB.

## E — Entities

`User`, `Membership`, `Event`, `Invitation` ([entities](../shared/entities.md)). No deltas.

## A — Approach

A single `/admin` page guarded by `requireRole('Admin')` (platform-admin flag). Cross-tenant
reads (admin is the only cross-tenant role) via scoped queries. Invite-Director server
action reuses `lib/auth/invitations.ts`. Keep it one page; defer reassign-owner + rich
audit unless trivial.

## S — Structure

```
app/(app)/admin/page.tsx          ← admin-only; users, events, pending invites + invite form
app/(app)/admin/actions.ts        ← "use server": inviteDirector(email)
lib/db/queries.ts                 ← (EXTEND) listUsers, listAllEvents, listPendingInvites
components/admin/InviteDirectorForm.tsx
```

## O — Operations

1. **Guard.** `/admin` calls `requireRole('Admin')`; non-admin → `notFound()`.
   - _Accept:_ non-admin request 404s server-side.
2. **Overview.** Render users (+roles), all events (+owner+status), pending invitations.
   - _Accept:_ lists render from scoped admin queries; typechecks.
3. **Invite Director.** `inviteDirector` server action → `createInvitation({role:'Director'})`.
   - _Accept:_ creates a pending invite; only an admin may call it.
4. **Verify.** format/lint/typecheck/test/build green with no DB.

## N / S — deltas

Inherit [norms](../shared/norms.md)/[safeguards](../shared/safeguards.md). Admin is the
only cross-tenant role; still server-checked. No destructive cascade on user removal
(block/soft — deferred action).

## Changelog

- 2026-06-30 — created (role layer); forum/ADR-0006. Approved.
