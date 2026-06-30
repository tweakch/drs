---
id: DRS-0001
slice: repo-foundation
type: analysis
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0001-repo-foundation.story.md
---

# Analysis — DRS-0001 · Repository & delivery foundation

## Domain keywords

This slice is about the **development domain**, not the race domain — so it touches no
entities in [`../shared/entities.md`](../shared/entities.md). It instead realises the
_governance_ halves of the REASONS Canvas ([`norms`](../shared/norms.md),
[`safeguards`](../shared/safeguards.md)) as concrete repo configuration, and sets up the
SPDD process documented in [`../README.md`](../README.md) / [`../WORKFLOW.md`](../WORKFLOW.md).

## Prototype references

None directly. The prototype (`../../wohlen-race-analysis.html`) is _reference material_
that must be **excluded** from the deployed bundle (`.vercelignore`) but kept in git
until its views are ported.

## Existing code touched

Greenfield. Repo currently holds only the prototype HTML and the `prompts/` tree. This
slice creates the root tooling/config but **no application source** (that's DRS-0002).

## The central design tension: foundation before app

Several tools are framework-coupled (ESLint-for-Next, `tsconfig`, Vitest wiring), while
others are framework-agnostic (git hygiene, Prettier, Husky, commitlint, Renovate,
governance docs, Vercel project, CI shape). The clean split:

- **DRS-0001 (here):** everything framework-agnostic + the _shape_ of the pipeline.
- **DRS-0002:** the Next.js app and the framework-coupled lint/type/test config that
  fills the script bodies.

### Key decision — CI "green on foundation state" strategy

CI must pass before the app exists, or the foundation can't merge. Options:

1. **Script placeholders that exit 0** — `package.json` defines `lint`/`typecheck`/
   `test`/`format:check`; before the app lands, `lint`/`typecheck`/`test` are no-op
   scripts (e.g. `echo "pending DRS-0002" `) while `format:check` runs for real on the
   markdown/config that already exists. DRS-0002 replaces the no-ops with real commands.
   _Recommended_ — CI workflow is final from day one; only script bodies change.
2. Conditional CI steps / `continue-on-error` — messier, hides real failures later.
3. Defer CI to DRS-0002 — rejected; CI shape is foundational.

→ Go with **(1)**. The CI YAML is authored once, correctly; Renovate, commitlint, and
Prettier are _fully_ active immediately (they need no app).

### Key decision — env validation now vs. with the app

A runtime zod env schema needs application code. So this slice ships the **env-var
contract** (`.env.example`, the three Vercel environments, names + purpose documented in
CONTRIBUTING) and an ADR fixing the policy "validate env at the boundary with zod";
DRS-0002 implements the schema. Avoids putting orphan code in a no-app repo.

### Key decision — deploy via Vercel Git integration, not a deploy Action

Trunk-based + previews is exactly Vercel's native Git integration: PR → preview, merge
to `main` → production. So **no GitHub deploy workflow** — GH Actions owns _quality
gates_, Vercel owns _deploys_. `vercel.json` configures framework/region/build; the repo
is linked in the Vercel dashboard. Cleaner than running `vercel deploy` from CI.

## Other decisions & trade-offs

- **Renovate over Dependabot** — grouping, scheduling, lockfile maintenance, and a
  single config file. (Decided.)
- **Node 22 LTS** pinned via `.nvmrc` + Corepack `packageManager: pnpm@<x>`;
  `engines.node: ">=20"` for tolerance. Adjustable.
- **Husky v9 + lint-staged** — `pre-commit`: lint-staged (Prettier on staged, plus
  `eslint --fix` once DRS-0002 adds ESLint); `commit-msg`: commitlint. Conventional
  Commits pair naturally with Renovate and a clean history.
- **ADRs** in `docs/adr/` (MADR-style template). Seeds: 0001 SPDD adoption, 0002 stack,
  0003 persistence, 0004 trunk-based + Vercel previews, 0005 Node/pnpm policy. ADRs are
  the long-term memory of _why_, complementing the SPDD canvases' _what/how_.
- **Apache-2.0** — `LICENSE` + short header policy in CONTRIBUTING; `NOTICE` optional.
- **`prompts/` and `docs/` excluded from deploy** via `.vercelignore` (they're intent,
  not app), but **kept in git**.

## Risks & unknowns

- **CI placeholders masking failure** → mitigate: explicit `echo pending` scripts, an
  ADR/CONTRIBUTING note, and a DRS-0002 acceptance item to replace them.
- **Husky hooks not running in CI / on fresh clones** → `prepare` script installs Husky;
  CI uses `--frozen-lockfile` and doesn't depend on hooks (CI re-runs the same checks).
- **Vercel project not yet created** → foundation documents the linking steps and ships
  `vercel.json`; actual linking is a one-time dashboard action recorded in the README.
- **Corepack/pnpm version drift** → pin exact pnpm in `packageManager`; Renovate keeps
  it current.

## Suggested Operations outline

1. Git & editor hygiene (`.gitignore`, `.gitattributes`, `.editorconfig`).
2. Runtime/PM baseline (`.nvmrc`, Corepack `packageManager`, `.npmrc`, root
   `package.json` with engines + script names + tooling devDeps).
3. Formatting (`.prettierrc`, `.prettierignore`).
4. Commit quality gate (Husky `pre-commit`/`commit-msg`, lint-staged, commitlint).
5. Dependency automation (`renovate.json`).
6. Governance & docs (LICENSE, README, CONTRIBUTING, SECURITY, CODEOWNERS, PR/issue
   templates, `docs/adr/` template + seed ADRs).
7. CI pipeline (`.github/workflows/ci.yml`) with the placeholder-script strategy.
8. Vercel & env contract (`vercel.json`, `.vercelignore`, `.env.example`, documented
   environments + linking steps).
