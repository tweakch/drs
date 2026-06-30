---
id: DRS-0003
slice: auth-foundation
type: canvas
status: implemented
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0003-auth-foundation.story.md
source_analysis: ../analysis/DRS-0003-20260630-analysis-auth-foundation.md
depends_on: DRS-0002-app-scaffold
---

# REASONS Canvas — DRS-0003 · Authentication & access foundation

> Build contract for the auth mechanism. Parameters resolved in
> [ADR-0006](../../docs/adr/0006-auth-and-rbac.md). Keep it simple; build/CI must pass with
> no secrets (env-gated).

## R — Requirements

Server-side identity + RBAC foundation: magic-link sign-in, DB sessions, event-scoped
authorization, invitations, route protection. Mechanism only — role surfaces are
DRS-0004…0007. **DoD:** sign-in/out works on a configured preview; `lib/auth` helpers
enforce role+scope server-side, deny-by-default; invitations issue→accept→membership;
`format/lint/typecheck/test/build` green with **no** DB/Resend env.

## E — Entities

[`../shared/entities.md`](../shared/entities.md): `User`, `Role`, `Event`, `Membership`,
`Invitation`, plus Auth.js adapter tables. **Delta:** none beyond what entities already
documents.

## A — Approach

Auth.js v5 (`auth.ts` → `{ handlers, auth, signIn, signOut }`) + `@auth/pg-adapter` over a
Neon `Pool` → **database sessions**; **Resend** magic link. Enrich the session with
`isPlatformAdmin` + memberships via the `session` callback; **resolve per-request scope
from the URL** vs memberships. One authz choke point in `lib/auth/`. Invitation tokens are
random, **hashed at rest**, single-use, expiring. First admin via `ADMIN_EMAILS`. Pin the
auth route handler to the **Node** runtime; keep middleware DB-free.

## S — Structure

```
auth.ts                                  ← NextAuth config (adapter, Resend, callbacks)
middleware.ts                            ← guard (app); redirect unauth -> /signin
app/api/auth/[...nextauth]/route.ts      ← export { GET, POST } = handlers; runtime nodejs
app/(auth)/signin/page.tsx               ← email form -> signIn("resend")
app/(auth)/verify-request/page.tsx       ← "check your email"
app/invite/[token]/page.tsx              ← accept invitation -> creates membership
types/next-auth.d.ts                     ← augment Session/User (role/scope/admin)
lib/auth/
  index.ts                               ← re-exports
  rbac.ts                                ← getSession, requireUser, requireRole,
                                           requireScope({eventId,teamId}), can(action,res)
  scope.ts                               ← resolveScope(session, {eventId,teamId})
  invitations.ts                         ← createInvitation, acceptInvitation, hashToken
  admin.ts                               ← isBootstrapAdmin(email) via ADMIN_EMAILS
lib/db/
  schema.sql                             ← (EXTEND) auth tables + events/memberships/invitations
  queries.ts                             ← typed membership/event/invitation queries (scoped)
lib/env.ts                               ← (EXTEND) AUTH_SECRET, AUTH_RESEND_KEY,
                                           AUTH_EMAIL_FROM, ADMIN_EMAILS
lib/auth/rbac.test.ts                    ← role/scope/deny + hierarchy
lib/auth/invitations.test.ts             ← token hash + lifecycle (pure parts)
.env.example                             ← (EXTEND) the four AUTH_* / ADMIN_EMAILS names
```

**Deps:** `next-auth@^5` (beta), `@auth/pg-adapter`. (Neon Pool, zod already present.)

## O — Operations

1. **Deps + env.** Add `next-auth@^5`, `@auth/pg-adapter`. Extend `lib/env.ts` and
   `.env.example` with `AUTH_SECRET`, `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM`, `ADMIN_EMAILS`
   (lazy/optional so build needs none).
   - _Accept:_ `pnpm build` passes with no auth env set.
2. **Schema.** Extend `lib/db/schema.sql` with Auth.js adapter tables (`users`,
   `accounts`, `sessions`, `verification_token`) + `events`, `memberships`, `invitations`
   (per entities; tokens stored hashed). `pnpm migrate` applies it.
   - _Accept:_ migration is valid SQL; tables match the entities/adapter.
3. **Auth config.** `auth.ts`: NextAuth + `PostgresAdapter(pool)` + Resend provider +
   `session` strategy "database" + `session`/`signIn` callbacks (enrich session; bootstrap
   admin from `ADMIN_EMAILS`). Route handler exports `GET/POST`, `runtime = "nodejs"`.
   Augment types in `types/next-auth.d.ts`.
   - _Accept:_ typechecks; importing `auth.ts` needs no live DB.
4. **RBAC choke point.** `lib/auth/rbac.ts` + `scope.ts`: `getSession`, `requireUser`,
   `requireRole`, `requireScope`, `can`; deny-by-default; cross-tenant → 404. Scope from
   URL args, checked vs memberships.
   - _Accept:_ unit tests prove allow/deny + hierarchy; no client-trusted scope.
5. **Invitations.** `lib/auth/invitations.ts`: `createInvitation` (issuer out-ranks;
   random token; store SHA-256 hash; expiry), `acceptInvitation` (verify hash, single-use,
   create membership). Server actions wrap these; `app/invite/[token]` accepts.
   - _Accept:_ token hashed at rest; expired/used → rejected; tests cover lifecycle.
6. **UI + middleware.** `/signin` (email → `signIn("resend")`), `/verify-request`;
   `middleware.ts` redirects unauthenticated `(app)` requests to `/signin` (no DB calls).
   - _Accept:_ unauth → redirected; authed → passes; routes typecheck/build.
7. **Verify.** `format:check`, `lint`, `typecheck`, `test`, `build` all green with no env.
   - _Accept:_ all five gates pass on a clean checkout.

## N — Norms (deltas)

Inherits [`../shared/norms.md`](../shared/norms.md) (Authentication & authorization). All
authz server-side; one choke point; scope every query.

## S — Safeguards (deltas)

Inherits [`../shared/safeguards.md`](../shared/safeguards.md) (auth + tenant isolation).
No secrets client-side; tokens hashed at rest; build needs no secrets; pin Node runtime
for DB-backed auth paths.

## Changelog

- 2026-06-30 — created; open questions resolved via design forum → ADR-0006. Approved.
- 2026-06-30 — **implemented** via `spdd-generate` (delegated); gates green with no env
  (lint/typecheck/test [25 tests]/build). Code-first sync deviations: middleware uses
  `export default NextAuth(authConfig).auth` (Next 16 rejects the destructured export) with a
  split `auth.config.ts`; `can(session, …)` takes the session explicitly; `createInvitation`
  takes `invitedByRole` (out-rank enforced in the choke point); `rbac.getSession`
  lazy-imports `@/auth` so predicates test without the Node adapter; the primary gate is the
  `(app)` layout `auth()` check (middleware is the coarse redirect).
