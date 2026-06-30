# ADR-0006: Authentication & role-based access control

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** tweakch (decisions resolved via a three-lens design forum — security,
  pragmatic delivery, product/role-UX)

## Context

DRS needs auth from the start so authorization is woven through the app rather than
retrofitted. The product has four kinds of users (Admin, Director, Team, Driver) and is
multi-tenant by **event**. We want the simplest safe mechanism on our Next.js + Neon +
Vercel stack.

## Decision

**Auth.js (NextAuth v5)** with a **PostgreSQL adapter on Neon** (`@auth/pg-adapter` over a
`@neondatabase/serverless` Pool) and **database session strategy**. Sign-in is
**passwordless magic link via the Resend provider** (no passwords stored). Access is
**invite-only and hierarchical** (Admin → Director → Team → Driver) and **event-scoped**;
authorization is enforced **server-side** through a single choke point (`lib/auth/`). See
[`../../prompts/shared/norms.md`](../../prompts/shared/norms.md) and
[`../../prompts/shared/safeguards.md`](../../prompts/shared/safeguards.md).

### Forum-resolved parameters (kept simple + safe)

1. **Email transport:** Resend (Auth.js first-party provider; one API key).
2. **First-Admin bootstrap:** `ADMIN_EMAILS` env allowlist — a matching email is granted
   the platform-admin flag on first sign-in. No public signup, no special endpoint.
3. **Sessions:** 30-day rolling DB sessions; server-side revocable (delete the row);
   refreshed on use. Suits occasional, around-the-event logins.
4. **Multiple memberships per user:** allowed. The **active scope is resolved per request
   from the URL's event/team id, checked against the user's memberships** — never from a
   client-supplied "active scope". A simple event picker is the UI.
5. **Removing a Director:** block (soft-archive) until their events are reassigned — never
   cascade-delete a tenant's race data.
6. **Event ownership:** exactly one owner per event for now (co-directors later if needed).
7. **Publish exposure:** a team sees its **own** full analysis plus the **field's overall
   results/rankings only** — never rivals' private detail.
8. **Event creation:** Directors self-serve (invite-only already gates who is a Director).
9. **Team managers:** one per team for now (model is extensible).
10. **Manager + Driver:** the same user may hold both, as two explicit memberships.
11. **Stint-tag visibility:** private to the team until the Director publishes.
12. **Driver view:** own numbers plus an anonymized rank vs the field; not others' raw data.
13. **Driver history:** current event only initially; the model allows cross-event later.

## Consequences

**Positive**

- Passwordless: no password storage/breach surface; one provider key.
- DB sessions are revocable and inspectable; role/scope ride on the session via callbacks.
- One authz choke point + scope-every-query keeps tenant isolation enforceable and testable.

**Negative / trade-offs**

- Magic link depends on email deliverability (Resend) and a working DB to sign in.
- DB-session reads add a query per request (acceptable; Neon is fast, sessions are small).

## Alternatives considered

- **Clerk / hosted auth** — fastest, but external dependency, cost, and user data off-Neon.
- **Credentials (password)** — we'd own password security and resets; rejected.
- **JWT (stateless) sessions** — not server-revocable; weaker for an access-controlled tool.
