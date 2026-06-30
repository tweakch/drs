---
id: DRS-0003
slice: auth-foundation
type: analysis
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0003-auth-foundation.story.md
---

# Analysis — DRS-0003 · Authentication & access foundation

> Clarify-gate open questions were resolved by a three-lens design forum (security /
> pragmatic / product) and recorded in [ADR-0006](../../docs/adr/0006-auth-and-rbac.md).
> This analysis frames the build.

## Domain keywords

`User`, `Role`, `Event`, `Membership`, `Invitation`, `Session` → all in
[`../shared/entities.md`](../shared/entities.md) (Identity & access). Authz rules in
[`../shared/norms.md`](../shared/norms.md) and [`../shared/safeguards.md`](../shared/safeguards.md).

## Existing code touched

Builds on DRS-0002. Reuses `lib/env.ts` (zod), `lib/db` (Neon), and the `(app)` route
group. Adds an auth layer; no feature view behaviour.

## Key decisions & trade-offs (from ADR-0006)

- **Auth.js v5** exports `{ handlers, auth, signIn, signOut }` from `auth.ts`; the App
  Router route handler re-exports `GET/POST`. Session read in RSC/handlers via `auth()`.
- **Adapter:** `@auth/pg-adapter` over a `@neondatabase/serverless` `Pool` → **database
  sessions**. Adapter owns `users`, `accounts`, `sessions`, `verification_token`.
- **Resend** provider for magic links (`AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM`).
- **Role/scope on the session:** a `session` callback enriches `session.user` with
  `isPlatformAdmin` and the caller's memberships; **per-request scope is resolved from the
  URL** (event/team id) against those memberships — never trusted from the client.
- **First admin:** `ADMIN_EMAILS` allowlist flips `users.is_platform_admin` on first sign-in.
- **Invitations:** random token, **stored hashed** (SHA-256), single-use, expiring; accept
  verifies the hash and creates the `Membership`. Issuer must out-rank the grant.
- **Middleware** guards `(app)` (redirect to sign-in) — coarse gate only.

## Risks & unknowns

- **Build without secrets:** auth config + adapter must import cleanly with no DB/Resend
  env (lazy Pool; `AUTH_SECRET` only needed at runtime). CI/build stay green. → env-gate.
- **Edge vs Node:** the pg adapter needs Node — pin `runtime = "nodejs"` on the auth route
  handler; keep middleware light (no DB in middleware).
- **Auth.js v5 is beta-track:** pin a known version; keep config minimal.
- **Type augmentation:** extend `next-auth` `Session`/`User` via `types/next-auth.d.ts`.

## Suggested Operations outline

1. Deps + env contract (`AUTH_SECRET`, `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM`, `ADMIN_EMAILS`).
2. DB schema: auth adapter tables + `events`, `memberships`, `invitations`; migrate.
3. `auth.ts` (NextAuth + pg adapter + Resend + callbacks) and the route handler (Node runtime).
4. `lib/auth/` choke point: `getSession`, `requireUser`, `requireRole`, `requireScope`, `can`.
5. Invitations: hashed-token create/accept (`lib/auth/invitations.ts`) + server actions.
6. UI: sign-in + verify-request pages; middleware guarding `(app)`; minimal "no access".
7. Admin bootstrap via `ADMIN_EMAILS` in the sign-in callback.
8. Tests: rbac helpers (role/scope/deny), token hash/lifecycle, hierarchy rule.
