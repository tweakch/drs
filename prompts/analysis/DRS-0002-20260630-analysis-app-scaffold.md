---
id: DRS-0002
slice: app-scaffold
type: analysis
status: draft
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0002-app-scaffold.story.md
---

# Analysis — DRS-0002 · Next.js application scaffold

> Repurposed from the original "foundation & scaffold" analysis after the foundation
> work was split out to [DRS-0001](../stories/DRS-0001-repo-foundation.story.md). This
> slice is the **running app** built on that platform. Carried over as `draft` — it
> still passes the clarify (step 2) and canvas-review (step 4) gates of its own loop.

## Builds on DRS-0001

The repository/delivery platform already exists: git hygiene, Prettier, Husky +
commitlint, Renovate, CI shape, governance/ADRs, `vercel.json`, `.vercelignore`, the
env-var contract, and a root `package.json` with **placeholder** `lint`/`typecheck`/
`test` scripts. This slice **fills those placeholders** with real commands and adds the
framework-coupled config (Next ESLint, `tsconfig`, Vitest wiring).

## Domain keywords

- **Race / Track / Team / Stint / Lap / Driver / Kart** → all in
  [`../shared/entities.md`](../shared/entities.md). This slice **mirrors** them into
  `types/` but implements no derivations. Stints are **derived** (computed from the lap
  sequence, not stored); driver/kart tags are **user-supplied** (persistence later).
- **Views (nine)** → become route segments + placeholders.
- **Virtual mode** → not built; noted so routing/state shape doesn't preclude it.

## Prototype references

Source of truth: `../../wohlen-race-analysis.html`.

- **Design tokens**: `:root` CSS variables (~L9–17) — asphalt/paint/hot/cool/warn/good
  palette; racing-paper `repeating-linear-gradient` body (~L19–27); Helvetica/мono stacks.
- **Series palette**: `PAL` array (~L487).
- **Shell**: `.wrap` (max-width 1180px); header eyebrow + `h1` (~L410–415); `nav.tabs`
  with nine `data-view` buttons + `showView()` (~L417–427); nine `.view` placeholders
  (~L429–467).
- **Formatters**: `FMT` (m:ss.mmm) and `fmtDuration` (~L475–486) — pure; port verbatim
  into `lib/analytics/format.ts`.
- **Engine (boundary only)**: `parseInput`(~495), `cleanLaps`(~526), `degradation`(~535),
  `splitStints`(~546), `classifyStints`(~581), `estimateEffects`(~610),
  `driverLeaderboard`(~648), `kartLeaderboard`(~684), `analyse`(~707) — extract their
  **types + signatures** as stubs; bodies are a later golden-master slice.
- **Real data**: `loadRealRace()` (official 28.06.2026 Wohlen, 5 teams, karts
  #54/#55/#69/#63/#64) → future golden-master fixture; capture its existence now.

## Key decisions & trade-offs

1. **App Router** (RSC, Vercel-native) — confirmed in DRS-0001 ADR-0002.
2. **Tokens twice**: CSS variables in `globals.css` (faithful, runtime-themable) **and**
   mapped into the Tailwind theme so `bg-asphalt`/`text-hot` resolve. Avoids duplicating
   hex codes. _(Open question in the story: theme-only is the alternative.)_
3. **Engine: signatures + types only** now; the two pure formatters copied in full.
4. **DB: typed SQL** via `@vercel/postgres` + SQL migrations; no ORM yet (revisit —
   story open question).
5. **Nine views as a route group** under a shared layout hosting the tab nav; each view
   its own URL (mirrors the prototype's tab model).
6. **Env validation**: implement the zod schema now (the orphan-code concern from
   DRS-0001 is gone — there's an app to consume it), validating the DRS-0001 env contract
   at startup/boundary.
7. **Replace CI placeholders**: turn the DRS-0001 `echo "pending"` scripts into real
   `eslint`/`tsc --noEmit`/`vitest run`; CI becomes genuinely green.

## Risks & unknowns

- **Token fidelity** — the dense dark aesthetic is part of the product; port variables
  verbatim and visually check against the prototype.
- **Edge vs Node runtime** for DB/Blob — `@vercel/postgres` prefers Node; pin Node
  runtime on DB route handlers; keep `lib/analytics` runtime-neutral.
- **First real preview deploy** — `vercel.json` build/install from DRS-0001 must resolve
  for the real app; verify on the preview URL.
- **Scope creep** into a feature view — acceptance criteria forbid it.

## Suggested Operations outline

1. App tooling: Next.js + TS strict (`tsconfig`, `next.config`), Tailwind/PostCSS, Next
   ESLint, Vitest + React plugin; extend the DRS-0001 `package.json` with app deps and
   replace the placeholder `lint`/`typecheck`/`test` scripts with real commands.
2. Port design tokens → `globals.css` + Tailwind theme.
3. App shell: root + `(app)` layout (Header + TabNav), `/` → `/data` redirect.
4. Nine placeholder pages.
5. Mirror domain types in `types/`.
6. `lib/analytics/` boundary (types, formatters, stubbed engine, smoke test) — pure.
7. Data layer env-gated (`lib/db`, `lib/blob`) + `lib/env.ts` zod validation.
8. Replace CI placeholders with real checks; first green Vercel preview deploy.
