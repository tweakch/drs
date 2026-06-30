---
id: DRS-0002
slice: app-scaffold
type: canvas
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0002-app-scaffold.story.md
source_analysis: ../analysis/DRS-0002-20260630-analysis-app-scaffold.md
depends_on: DRS-0001-repo-foundation
---

# REASONS Canvas — DRS-0002 · Next.js application scaffold

> Repurposed from the original "foundation & scaffold" canvas after the foundation work
> moved to [DRS-0001](./DRS-0001-20260630-canvas-repo-foundation.md). This slice is the
> **running application** on top of that platform. Carried over as `draft` — it must
> still pass its own canvas-review gate before `spdd-generate`. No feature view is
> ported in this slice.

---

## R — Requirements

**Problem.** The repository foundation (DRS-0001) exists but there is no application.
We need the Next.js + TypeScript + Tailwind skeleton — design system, nine-view
navigation shell, domain types, the pure analytics-engine boundary, and the env-gated
Postgres + Blob data layer — plus the framework-coupled config that fills DRS-0001's
placeholder scripts, so feature slices have a home and the first real preview deploys.

**In scope.**
- Next.js (App Router) + TS (strict): `tsconfig`, `next.config`, Next ESLint, Vitest.
- Extend the DRS-0001 `package.json` with app deps; **replace** the placeholder
  `lint`/`typecheck`/`test` scripts with real commands.
- Design tokens ported from the prototype (palette, fonts, racing-paper background).
- App shell: header + nine-view tab nav; each view a route with a placeholder.
- `types/` mirroring [`../shared/entities.md`](../shared/entities.md).
- `lib/analytics/` pure boundary: types + stubbed signatures + the two formatters + smoke test.
- `lib/db/` (schema migration + typed client) and `lib/blob/`, env-gated, unused by UI.
- `lib/env.ts` zod validation of the DRS-0001 env contract.

**Out of scope.**
- Repo/Vercel/CI/governance **foundation** (DRS-0001).
- Porting any feature view's logic/UI; implementing engine bodies; persisting tags;
  auth; sharing; exports. (Each a later slice.)

**Definition of done.** All
[story acceptance criteria](../stories/DRS-0002-app-scaffold.story.md#acceptance-criteria)
met: `pnpm dev` runs; tokens applied; shell + nine routes render placeholders; pure
`lib/analytics/` + smoke test; `types/` mirrors entities; DB+Blob wired & env-gated;
env validated via zod; DRS-0001 placeholder scripts replaced and CI genuinely green;
first Vercel preview deploys.

---

## A — Approach

Stand up the Next.js app on the DRS-0001 platform, port the *look* and *navigation*
faithfully, and establish the **module boundaries** the rest of the app depends on —
especially the pure `lib/analytics/` isolation — while deferring all feature behaviour.

Key decisions (from analysis):
- **App Router** (per DRS-0001 ADR-0002).
- **Tokens twice**: CSS variables in `globals.css` *and* mapped into the Tailwind theme.
- **Engine: signatures + types only**; the two pure formatters copied in full.
- **DB: typed SQL** via `@vercel/postgres` + SQL migrations; no ORM yet.
- **Nine views as a route group** under a shared layout that renders the tab nav.
- **Env validated with zod** (`lib/env.ts`) now that there's an app to consume it.
- All DB/Blob code **env-gated** so build/CI never need a live database.

Rejected: Pages Router; porting a view now; adding an ORM up front; re-deriving repo
config (owned by DRS-0001).

---

## E — Entities

References [`../shared/entities.md`](../shared/entities.md). This slice **mirrors** the
domain into `types/` but implements no derivations.

- `Race`, `Track`, `Team`, `Lap`, `Stint`, `Driver`, `Kart` → TypeScript types/interfaces.
- DB tables created for the persistence core: `races`, `teams`, `laps`. Stints are
  **derived** (computed from the lap sequence, not stored). Driver/kart tags are
  **user-supplied** per [`../shared/entities.md`](../shared/entities.md) and will need
  persistence in a later slice — out of scope here (no UI consumes the data yet).

**Deltas to the shared model:** none. (If type-mirroring reveals a gap, update
`shared/entities.md` in the same change.)

---

## S — Structure

Files created (the DRS-0001 foundation files already exist — this slice **adds the app**
and **extends** `package.json`):

```
# --- app tooling (extends DRS-0001 foundation) ---
tsconfig.json                     ← strict
next.config.ts
eslint.config.mjs                 ← extends next/core-web-vitals (+ DRS-0001 base)
vitest.config.ts                  ← + @vitejs/plugin-react
postcss.config.mjs, tailwind.config.ts
package.json                      ← (EXTEND) add app deps; REPLACE placeholder
                                    lint/typecheck/test scripts with real commands

app/
  layout.tsx                      ← root layout, fonts, globals
  globals.css                     ← design tokens (CSS variables) + base
  (app)/
    layout.tsx                    ← app shell: header + <TabNav/>
    page.tsx                      ← redirect to /data
    data/page.tsx                 ← placeholder
    director/page.tsx             ← placeholder
    product/page.tsx              ← placeholder
    race/page.tsx                 ← placeholder
    team/page.tsx                 ← placeholder
    driver/page.tsx               ← placeholder
    kart/page.tsx                 ← placeholder
    detektiv/page.tsx             ← placeholder
    replay/page.tsx               ← placeholder

components/
  ui/                             ← shared primitives (Card, EmptyState, …)
  layout/Header.tsx, layout/TabNav.tsx

lib/
  env.ts                          ← zod validation of DRS-0001 env contract
  analytics/
    index.ts                      ← public surface (re-exports)
    types.ts                      ← engine-facing types
    format.ts                     ← FMT, fmtDuration (ported, pure)
    engine.ts                     ← stubbed signatures (throw "not implemented")
    format.test.ts                ← smoke + formatter unit tests
  db/
    client.ts                     ← typed @vercel/postgres wrapper (env-gated)
    schema.sql                    ← races/teams/laps DDL
    migrate.ts                    ← runs schema.sql
  blob/
    client.ts                     ← @vercel/blob helpers (env-gated)

types/
  index.ts                        ← Race/Track/Team/Lap/Stint/Driver/Kart (mirror entities)
```

**Dependencies added:** `next`, `react`, `react-dom`, `tailwindcss`, `postcss`,
`autoprefixer`, `@vercel/postgres`, `@vercel/blob`, `zod`, `chart.js`
(+ `react-chartjs-2` when the first chart view lands); dev: `typescript`, `vitest`,
`@vitejs/plugin-react`, `eslint-config-next`, `@types/*`. (Prettier/Husky/commitlint
already provided by DRS-0001.)

**Integration points:** consumes DRS-0001's `vercel.json`, `.vercelignore`, env contract,
CI workflow, and root `package.json`. Env vars (`POSTGRES_URL`/`POSTGRES_*`,
`BLOB_READ_WRITE_TOKEN`) validated by `lib/env.ts`. No UI consumes DB/Blob this slice.

---

## O — Operations

1. **App tooling.** Init Next.js App Router + TS (strict): `tsconfig`, `next.config`,
   Tailwind/PostCSS, Next ESLint, Vitest + React plugin. Extend the DRS-0001
   `package.json` with app deps and **replace** the placeholder `lint`/`typecheck`/`test`
   scripts with real commands (`eslint`, `tsc --noEmit`, `vitest run`).
   - *Acceptance:* `pnpm dev` serves a page; `pnpm lint`, `pnpm typecheck`, `pnpm test`
     run for real; the DRS-0001 "pending" echoes are gone.
2. **Port design tokens.** Add the prototype's palette + fonts + racing-paper background
   to `globals.css` as CSS variables; map them in the Tailwind theme.
   - *Acceptance:* `bg-asphalt`/`text-hot`/etc. resolve; body shows the dark racing-paper
     background; values match the prototype `:root` / `shared/entities.md`.
3. **Build the app shell.** `(app)/layout.tsx` renders `Header` (eyebrow + title) and
   `TabNav` (nine views, active-route highlight); `(app)/page.tsx` redirects to `/data`.
   - *Acceptance:* nav shows nine tabs; routing works; active tab highlighted; visual
     parity with the prototype header/tabs.
4. **Placeholder pages.** Each of the nine segments renders an `EmptyState`.
   - *Acceptance:* all nine routes return 200 and render their placeholder.
5. **Mirror domain types.** `types/index.ts` defines Race/Track/Team/Lap/Stint/Driver/
   Kart matching `shared/entities.md`.
   - *Acceptance:* types compile; fields/enums match the entities doc.
6. **Analytics boundary.** `lib/analytics/`: `types.ts`, `format.ts` (port `FMT` &
   `fmtDuration` verbatim, pure), `engine.ts` (signatures for parse/cleanLaps/
   degradation/splitStints/classifyStints/estimateEffects/leaderboards/analyse that
   `throw new Error("not implemented")`), `index.ts` re-exports. **No React/DOM/Next
   imports** anywhere in this folder.
   - *Acceptance:* `format.test.ts` passes (e.g. `FMT(62.8)==="1:02.800"`,
     `FMT(53.4)==="53.400"`); importing `lib/analytics` pulls in no React.
7. **Data layer (env-gated) + env validation.** `lib/db/schema.sql` (races/teams/laps
   DDL), `migrate.ts`, typed `client.ts`; `lib/blob/client.ts`; `lib/env.ts` validates
   the DRS-0001 env contract with zod. All read env lazily and fail with a clear error if
   unset; nothing in the UI imports them yet.
   - *Acceptance:* build & CI pass with **no** DB env present; `pnpm migrate` applies
     schema when env is set; missing/invalid env yields a clear `lib/env.ts` error.
8. **CI real + first deploy.** Confirm CI (now running real lint/type/test) is green;
   ensure DRS-0001's `vercel.json` install/build resolve for the real app; verify the
   first Vercel **preview** deploy renders the shell.
   - *Acceptance:* CI green on a clean checkout; preview deploys with only env vars set;
     shell renders on the preview URL; `main` promotes to production.

---

## N — Norms (deltas only)
Inherits [`../shared/norms.md`](../shared/norms.md). Slice-specific:
- Realises the `norms.md` project structure (`app/`, `lib/`, `types/`, `components/`).
- `lib/analytics/engine.ts` stubs must still satisfy `strict` typing (typed signatures,
  bodies throw).
- Keep `lib/analytics/` free of React/DOM/Next imports (the purity boundary).

## S — Safeguards (deltas only)
Inherits [`../shared/safeguards.md`](../shared/safeguards.md). Slice-specific:
- **Build must not require a live database or Blob.** DB/Blob access is env-gated; CI and
  `next build` pass with no credentials.
- `lib/env.ts` must fail fast and clearly on missing/invalid env — never silently
  proceed with undefined config.
- Preserve the analytics purity boundary from day one (the safeguard that makes the
  engine testable in the golden-master slice).

---

## Changelog
- 2026-06-30 — repurposed from the original "foundation & scaffold" canvas after the
  split; foundation concerns removed (now DRS-0001). Scope = Next.js app scaffold only.
  Status `draft` — pending its own clarify + canvas-review gates.
