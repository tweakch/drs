---
id: SHARED
slice: cross-cutting
type: norms
status: approved
created: 2026-06-30
updated: 2026-06-30
---

# N — Norms (cross-cutting engineering standards)

Shared governance for every Canvas. A slice references this file and lists only its
**deltas**. These are the defaults the generator must follow.

## Language & framework

- **TypeScript**, `strict: true`. No `any` without an inline justification comment.
- **Next.js App Router** (`app/`). Server Components by default; add `"use client"`
  only where interactivity demands it (charts, editable grids, replay).
- **React 19** function components and hooks. No class components.
- Prefer Server Actions / Route Handlers over ad-hoc client fetch where it fits.

## Project structure

```
app/            route segments, layouts, pages (RSC by default)
components/      reusable UI (ui/ primitives, charts/, views/)
lib/            framework-agnostic domain logic
  analytics/    the race-analysis engine (pure functions, no React/DOM)
  db/           Postgres access (queries, schema)
  parse/        lap-data parsing
  blob/         Vercel Blob helpers
types/          shared TypeScript types (mirror shared/entities.md)
```

- **The analytics engine in `lib/analytics/` is pure and platform-free** — no React,
  no DOM, no Next imports. It is the most valuable, most testable code; keep it
  isolated so it can be unit-tested in milliseconds and reused server- or client-side.

## Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`. React components: `PascalCase` export.
- Functions/vars: `camelCase`. Types/interfaces: `PascalCase`. Constants: `UPPER_SNAKE`.
- Domain terms match [`entities.md`](./entities.md) exactly (Stint, Kart effect, etc.).
- Test files: `*.test.ts` next to the unit under test.

## Styling

- **Tailwind CSS v4** (CSS-first). Define the prototype's design tokens in `globals.css`
  under `@theme {}` (asphalt/paint/hot/cool/warn/good palette, the racing-paper feel);
  v4 emits the CSS variables and the utilities from there — no `tailwind.config.ts`.
- No inline `style=` except for truly dynamic values (chart colours, computed bars).
- Dark, high-contrast, data-dense aesthetic is intentional — preserve it.

## Data & types

- A single source of truth for domain types in `types/`, mirroring `entities.md`.
- Money/time as numbers in seconds (floats) internally; format only at the edge
  (reuse the prototype's `FMT` / `fmtDuration` semantics).
- Validate all external input (pasted laps, API bodies) with **Zod** at boundaries.

## Errors & observability

- Fail loud in dev, degrade gracefully in prod. Never swallow parse errors silently —
  surface them to the user (the Data/Director views already show parse errors).
- Use Next.js `error.tsx` / `not-found.tsx` boundaries per segment.
- Structured logging via `console` is fine on Vercel; no PII in logs.

## Testing

- **Vitest** for unit tests. The `lib/analytics/` engine must have high coverage —
  it encodes the domain rules and is the regression net (SPDD: tests come last).
- Test the _behaviour described in the Canvas Operations_, not implementation detail.
- Golden-master: the official 28.06.2026 Wohlen race is a fixture; its parsed result
  and derived stats are snapshot-tested so refactors can't silently change numbers.

## Tooling

- ESLint (next/core-web-vitals) + Prettier; CI fails on lint/type errors.
- Conventional-ish commits; commit prompts with the code they generate.
- Package manager: **pnpm**.

## Accessibility & i18n

- Locale is `de-CH` (matches the prototype). Keep German labels; structure for future
  i18n but don't over-engineer it now.
- Semantic HTML, keyboard-navigable tables/controls, sufficient contrast.

## Authentication & authorization

Introduced in DRS-0003. See [`entities.md`](./entities.md) (Identity & access) and the
auth rules in [`safeguards.md`](./safeguards.md).

- **Library:** Auth.js (NextAuth v5) with the **Neon/Postgres adapter** and **DB-backed
  sessions** (no JWT-in-cookie session state). Passwordless **email magic link** — DRS
  stores no passwords.
- **Model:** invite-only, hierarchical (Admin → Director → Team → Driver), **event-scoped**
  (`Membership` carries role + event + optional team/driver).
- **Authorize on the server, every time.** Every Route Handler, Server Action, and RSC
  data fetch resolves the caller's session and checks role + scope **server-side**. The
  client may hide UI, but **never** gates access. No authorization decision trusts a
  client-supplied id, role, team, or event.
- **One choke point.** Centralise authz in `lib/auth/` — `getSession()`, `requireRole()`,
  `requireScope({ eventId, teamId })`, and a `can(action, resource)` helper. Features call
  these; they do not re-implement checks ad hoc.
- **Middleware** protects route groups (redirect unauthenticated → sign-in); it is a
  coarse gate, **not** a substitute for per-resource server checks.
- **Scope every query.** Data access functions take the resolved scope and filter by it
  (event/team) in the query — never fetch-all-then-filter-in-JS.
- **Deny by default.** Unknown role/scope → 403/404 (prefer 404 to avoid leaking
  existence across tenants). New resources are inaccessible until a rule grants access.
- **Invitations** are server-issued, single-use, expiring, hashed-at-rest tokens; the
  issuer must out-rank the granted role. Accepting creates the `Membership`.
- **Naming:** roles are the enum `Admin | Director | Team | Driver`; helpers and tables
  use those exact terms.
- **Auditability:** record who invited/role-changed/removed whom (actor, target, when).
