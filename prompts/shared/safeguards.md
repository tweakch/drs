---
id: SHARED
slice: cross-cutting
type: safeguards
status: approved
created: 2026-06-30
updated: 2026-06-30
---

# S — Safeguards (non-negotiable boundaries)

Invariants, limits, and rules that must hold in **every** slice. A Canvas references
this file and may tighten — never loosen — these. If a slice needs to break one, that
is a design decision requiring explicit human sign-off recorded in the Canvas.

## Analytics correctness (the crown jewels)

These derivations are the product. They must produce **identical numbers** to the
prototype for the same input (guarded by the golden-master snapshot — see
[`norms.md`](./norms.md) testing):

- Outlier rule: IQR fence `[Q1 − 1.5·IQR, Q3 + 1.5·IQR]`, min 4 laps.
- Grid-lap exclusion: first lap < 0.5 × racing median.
- Pit/stint split threshold: 1.35 × racing median, current stint ≥3 laps.
- Effects decomposition: kart effects centred to mean 0; driver pace = average-kart
  expectation. Report R² and crossover validity honestly; **never** present a
  decomposition as reliable when crossover is insufficient or R² is low.
- Statistics use sample standard deviation (n−1), as in the prototype.
- The engine is **pure and deterministic**: same input → same output, no clock/random.

## Data integrity

- The **canonical race is immutable** once ingested. Virtual / what-if results are
  derived and must never overwrite the official race in storage.
- Every persisted race retains its **raw source dump** (Blob) so it can be re-parsed.
- Schema migrations are forward-only and reviewed; no destructive migration without
  a backup step.

## Security

- All external input validated at the boundary (Zod) — pasted timing, API bodies,
  query params. Never trust client-supplied totals/derived values; recompute server-side.
- No secrets in the repo or client bundle. DB/Blob credentials only via Vercel env
  vars, accessed server-side. `NEXT_PUBLIC_*` is for non-secret config only.
- Parameterised queries only (no string-built SQL). No raw SQL from user input.
- Rate-limit write/ingest endpoints. Cap upload size (see limits).

## Limits (performance & abuse)

- Max raw timing upload: **5 MB** per race (Blob). Reject larger with a clear error.
- Max teams per race: **64**; max laps per team: **2000** (a 2h race is ~130 laps).
- Parsing and full analysis of a typical race (≤17 teams) must complete in **<200 ms**
  server-side; never block the request thread on the client for >1 frame — offload
  heavy recompute appropriately.
- Replay animation targets 60 fps; degrade gracefully on weak devices.

## Privacy

- Driver names are user-supplied and may be real people: treat as low-sensitivity PII.
  No third-party analytics on name data; no names in logs.
- Locale `de-CH`; respect Swiss/EU expectations (no surprise data sharing).

## Platform

- Must deploy cleanly to **Vercel** with zero manual steps beyond env vars.
- Stay within Vercel serverless function limits (memory/time); long jobs must be
  chunked or moved off the request path.
- No Node-only APIs in Edge runtime code paths unless the runtime is pinned to Node.

## Authentication & authorization (non-negotiable)

Introduced in DRS-0003. These hold in every slice that touches user data.

- **Server-side enforcement, always.** Authentication and authorization are checked on
  the server for every Route Handler, Server Action, and data-loading RSC. Client-side
  checks are cosmetic only. An unauthenticated request to a protected resource gets no
  data.
- **Never trust client-supplied identity or scope.** Role, userId, eventId, teamId, and
  driverId used for access decisions come from the **server session / `Membership`**, not
  from request bodies, params, or headers.
- **Deny by default.** No matching rule → denied. Prefer **404 over 403** for
  cross-tenant resources so existence isn't leaked.
- **Least privilege & hierarchy.** A user can only grant/manage roles **below** their
  own tier and **within** their scope. No privilege escalation paths (e.g. a Team cannot
  mint a Director; a Director cannot touch another Director's event).
- **Sessions:** DB-backed (Auth.js + Neon), httpOnly + Secure + SameSite cookies, sensible
  expiry/rotation, server-side revocation on removal. No password storage (magic link).
- **Invitation tokens:** single-use, time-limited, **hashed at rest**, bound to email +
  role + scope; revocable. Issuer must out-rank the granted role.
- **No secrets client-side.** `AUTH_SECRET` and provider/email creds are server-only env
  vars (see `.env.example`); never `NEXT_PUBLIC_*`.
- **Audit trail** for access-control changes (invite, accept, role change, removal):
  actor, target, scope, timestamp. No tokens or magic-link URLs in logs.

## Multi-tenant data isolation (event-scoped)

- **Every domain query is scoped.** Reads and writes to races/teams/laps/stints and
  derived analysis are filtered by the caller's resolved event (and team, where the role
  is Team/Driver) **in the query** — not fetched broadly and filtered in app code.
- **A tenant sees only its own data.** A Team sees its own team's data within an event
  (plus published, intentionally-public results); a Driver sees their own; a Director sees
  their own events; only Admin is cross-tenant.
- **The canonical-race immutability rule still holds** and is now also an authz boundary:
  only a Director (owner) may ingest/replace the official race for their event; what-if
  remains derived and per-session.
- **IDs are not capabilities.** Knowing a uuid grants nothing; access always requires a
  matching `Membership`.
