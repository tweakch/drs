---
id: DRS-0004
slice: admin-role
type: story
status: draft
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0003-auth-foundation
---

# DRS-0004 · Admin role

## Story

**As an** Admin (platform operator)
**I want** platform-wide control — manage users and their roles, see and administer all
events, invite Directors, configure the system, and review an audit log
**so that** I can operate DRS, delegate event ownership, and keep access correct.

## Context

Admin is the **only cross-tenant** role (global `isPlatformAdmin` / Admin membership). It
sits at the top of the hierarchy and is the entry point that bootstraps everything else by
inviting Directors. Built on [DRS-0003](./DRS-0003-auth-foundation.story.md). See
[`../shared/entities.md`](../shared/entities.md) and the auth rules in
[`../shared/safeguards.md`](../shared/safeguards.md).

## Acceptance criteria

- [ ] Admin-only area (route group) reachable only by a platform Admin; everyone else gets
      404, enforced server-side.
- [ ] User management: list users, view their memberships/roles, grant/revoke the
      **Director** role, deactivate/remove a user (server-side, hierarchy-respecting).
- [ ] Invite a Director (issue invitation per DRS-0003); see/revoke pending invitations.
- [ ] Events overview: list **all** events with owner and status; reassign event ownership
      to another Director.
- [ ] Audit log view: who invited/role-changed/removed whom, with actor + scope + time.
- [ ] System config surface (placeholder is acceptable this slice — e.g. default region,
      feature flags).

## INVEST check

- **Independent** — depends on DRS-0003 only.
- **Negotiable** — depth of system config, impersonation (see out of scope).
- **Valuable** — without an Admin, no Directors can be onboarded.
- **Estimable** — yes.
- **Small** — control-plane CRUD + audit view; no race analytics.
- **Testable** — access denied for non-admins; grant/revoke + audit verified.

## Out of scope

- The features Admins oversee (race ingest/analysis live in Director/Team/Driver + data
  slices).
- **Impersonation / "log in as"** — deferred (high-risk; needs its own story + audit).
- Billing/subscription management.

## Open questions (resolve at clarify gate)

- Should removing a Director cascade (orphan their events) or block until reassigned?
- How many platform Admins are expected (single owner vs. several)?
- Is a read-only "support" admin tier needed later?
