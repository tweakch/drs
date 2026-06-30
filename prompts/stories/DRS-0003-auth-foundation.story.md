---
id: DRS-0003
slice: auth-foundation
type: story
status: draft
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0002-app-scaffold
enables: [DRS-0004-admin-role, DRS-0005-director-role, DRS-0006-team-role, DRS-0007-driver-role]
---

# DRS-0003 · Authentication & access foundation

## Story

**As the** team building DRS
**I want** an identity, session, and role-based access foundation — passwordless
magic-link sign-in, DB-backed sessions, event-scoped RBAC, an invitation system, and
server-side route/resource protection
**so that** every feature can rely on "who is this, and what may they do here?" being
answered on the server, and the four roles (Admin, Director, Team, Driver) have a
foundation to build on.

## Context

Auth is being added **from the beginning** so authorization is woven through the app
rather than retrofitted. Decisions (locked at clarify): **Auth.js (NextAuth v5)** with
the **Neon/Postgres adapter** and **DB sessions**, **passwordless magic link**;
**invite-only, hierarchical** access (Admin → Director → Team → Driver); **event-scoped**
tenancy. See [`../shared/entities.md`](../shared/entities.md) (Identity & access),
[`../shared/norms.md`](../shared/norms.md) (Authentication & authorization), and
[`../shared/safeguards.md`](../shared/safeguards.md) (auth + multi-tenant isolation).

This slice delivers the **mechanism**; the per-role capabilities and surfaces are
DRS-0004…0007.

## Acceptance criteria

- [ ] Auth.js v5 configured with the Neon adapter and DB sessions; **magic-link** email
      sign-in; sign-in and sign-out work end to end.
- [ ] Schema: Auth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`)
      plus `events`, `memberships`, `invitations` (see entities); migration added to
      `lib/db`.
- [ ] `lib/auth/`: `getSession()`, `requireRole()`, `requireScope({ eventId, teamId })`,
      and `can(action, resource)` — the single authz choke point.
- [ ] Middleware protects the `(app)` route group: unauthenticated → sign-in; it is a
      coarse gate, not a replacement for per-resource server checks.
- [ ] **Deny by default**, server-side: a request without a matching `Membership` gets no
      data (404 preferred for cross-tenant resources).
- [ ] Invitation flow: a higher tier issues a single-use, expiring, hashed token bound to
      email + role + scope; accepting it creates the `Membership`. Issuer must out-rank
      the granted role.
- [ ] Env contract extended (`AUTH_SECRET`, email/magic-link transport vars) in
      `.env.example` and validated in `lib/env.ts`.
- [ ] First-Admin bootstrap path exists (see open questions) and is documented.
- [ ] Tests: authz helpers (role/scope/deny), the invitation token lifecycle, and the
      hierarchy rule (issuer out-ranks grant).

## INVEST check

- **Independent** — depends only on DRS-0002; enables the role slices.
- **Negotiable** — email transport, session lifetime, admin bootstrap can flex.
- **Valuable** — every later feature needs server-side identity + scope.
- **Estimable** — yes; conventional Auth.js + RBAC.
- **Small-ish** — the mechanism only; no role dashboards. Split further if it grows.
- **Testable** — helpers/invites unit-tested; sign-in/out verified on a preview.

## Out of scope (→ role slices & later)

- Per-role dashboards/capabilities (DRS-0004…0007).
- Gating specific race-data features (wired as those features land).
- OAuth/social login; SSO; org/billing; rate-limit tuning beyond safeguards.

## Open questions (resolve at clarify gate)

- **Email transport** for magic links — Resend (Vercel-friendly) vs SMTP vs other? Which
  env vars?
- **First-Admin bootstrap** — env-seeded allowlist (`ADMIN_EMAILS`) vs a one-time setup
  route vs manual DB insert?
- **Session lifetime / rotation** policy.
- Can one user hold multiple roles across events simultaneously (model allows it — confirm
  the UX of switching active scope)?
