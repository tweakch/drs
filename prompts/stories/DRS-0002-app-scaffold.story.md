---
id: DRS-0002
slice: app-scaffold
type: story
status: draft
created: 2026-06-30
updated: 2026-06-30
depends_on: DRS-0001-repo-foundation
---

# DRS-0002 · Next.js application scaffold

## Story
**As the** developers building DRS on the repository foundation from
[DRS-0001](./DRS-0001-repo-foundation.story.md)
**I want** the Next.js (App Router) + TypeScript + Tailwind application skeleton — design
tokens, the nine-view navigation shell with placeholders, the domain types, the pure
analytics-engine boundary, and the env-gated Postgres + Blob data layer
**so that** every feature slice has a conventional, deployable home and the first real
Vercel preview goes live.

## Context
Split out of the original "foundation & scaffold" story; the repository/delivery
platform is DRS-0001, **this** slice is the running application that sits on top of it.
It also **fills the framework-coupled bodies** the foundation left as placeholders:
ESLint (Next config), `tsconfig`, Vitest wiring, the real `lint`/`typecheck`/`test`
scripts, and runtime env validation.

Source of truth for look & navigation: `../../wohlen-race-analysis.html` (design tokens
in `:root` ~L9–17; header & tab nav ~L410–467; pure formatters `FMT`/`fmtDuration`
~L475–486; engine functions ~L489–751). No feature view's *behaviour* is ported here —
only the shell and the module boundaries.

## Acceptance criteria
- [ ] Next.js App Router + TypeScript (strict) app; `pnpm dev` serves locally.
- [ ] ESLint (next/core-web-vitals) + `tsconfig` + Vitest wired; the DRS-0001 CI
      placeholder scripts (`lint`/`typecheck`/`test`) are **replaced** with real commands
      and CI is genuinely green.
- [ ] Tailwind configured; the prototype's design tokens ported (palette/fonts/
      racing-paper background) as CSS variables + Tailwind theme.
- [ ] App shell renders: header (eyebrow + title) and the nine-view tab nav; each view a
      route segment under an `(app)` group with a placeholder; `/` redirects to `/data`.
- [ ] `types/` mirrors [`../shared/entities.md`](../shared/entities.md)
      (Race/Track/Team/Lap/Stint/Driver/Kart). Stints are **derived**, not stored;
      driver/kart tags are **user-supplied** (persistence is a later slice).
- [ ] `lib/analytics/` is a pure, framework-free module: engine types, the two formatters
      ported verbatim, stubbed engine signatures (`throw "not implemented"`), and a smoke
      test under Vitest. No React/DOM/Next imports in that folder.
- [ ] `lib/db/` (schema migration for `races`/`teams`/`laps`, typed client) and
      `lib/blob/` exist, **env-gated**, with no UI consumer yet; build/CI pass with no DB.
- [ ] Runtime env validation (zod schema) implemented per the DRS-0001 env contract.
- [ ] First Vercel **preview deploy** is green; `vercel.json` build/install resolve for
      the real app; shell renders on the preview URL.

## INVEST check
- **Independent** — depends only on DRS-0001 (the platform); no feature slice needed.
- **Negotiable** — engine stub depth, DB schema depth, how many `ui/` primitives.
- **Valuable** — first deployable app; unblocks all feature views.
- **Estimable** — yes; conventional scaffolding on a ready platform.
- **Small** — shell + boundaries only; **no feature view logic**.
- **Testable** — builds/lints/types/tests pass; shell renders; preview deploys.

## Out of scope
- Porting any feature view's logic/UI (Data, Director, Product, Race, Team, Driver,
  Kart, Detektiv, Replay) — each is its own later slice.
- Implementing the analytics engine bodies (a dedicated golden-master slice).
- Persisting driver/kart tags or virtual-mode state; auth; sharing; exports.

## Open questions (resolve at clarify gate)
- Tokens as CSS variables + Tailwind theme (both), or Tailwind theme only?
- Chart lib now (`chart.js` + `react-chartjs-2`) or defer to the first charting view?
- Typed SQL (`@vercel/postgres`) vs. adding an ORM (e.g. Drizzle) — analysis leaned
  typed SQL; revisit here.
