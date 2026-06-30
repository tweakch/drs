---
id: DRS-0006
slice: team-role
type: canvas
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0006-team-role.story.md
source_analysis: ../analysis/DRS-0004-20260630-analysis-role-layer.md
depends_on: DRS-0003-auth-foundation
---

# REASONS Canvas — DRS-0006 · Team role

## R — Requirements

A Team manager manages their own team within an event. **DoD:** sees only their own team
(others → 404), views roster, and **invites a Driver**; gates green with no DB. Stint
tagging + analysis deferred (engine stubbed) per the story sequencing note.

## E — Entities

`Membership`, domain `Team`, `Driver`, `Invitation` ([entities](../shared/entities.md)).

## A — Approach

Replace the `/team` placeholder with a team-scoped roster console. `requireScope({teamId})`
from the caller's membership. Invite-Driver reuses invitations (bound to team). One manager
per team for now; a user may also hold a Driver membership (two rows).

## S — Structure

```
app/(app)/team/page.tsx           ← own team + roster + invite-driver form
app/(app)/team/actions.ts         ← inviteDriver(teamId,email)
lib/db/queries.ts                 ← (EXTEND) getTeamForUser, listTeamRoster
components/team/RosterList.tsx, InviteDriverForm.tsx
```

## O — Operations

1. **Guard + team scope.** `/team` resolves the caller's Team membership; no membership or
   foreign team → 404.
   - _Accept:_ cannot view another team's roster.
2. **Roster.** List drivers + pending driver invites for the team.
   - _Accept:_ renders from team-scoped queries.
3. **Invite Driver.** `inviteDriver` → `createInvitation({role:'Driver',teamId})`.
   - _Accept:_ invite scoped to the team; only that team's manager may call it.
4. **Verify.** gates green with no DB.

## N / S — deltas

Inherit. Stint tags will be private-to-team-until-published (enforced when tagging lands).
Strict team isolation; 404 over 403 cross-tenant.

## Changelog

- 2026-06-30 — created (role layer); forum/ADR-0006. Approved.
