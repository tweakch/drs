---
id: DRS-0001
slice: repo-foundation
type: canvas
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0001-repo-foundation.story.md
source_analysis: ../analysis/DRS-0001-20260630-analysis-repo-foundation.md
---

# REASONS Canvas — DRS-0001 · Repository & delivery foundation

> Executable blueprint for the repository/delivery platform we develop on for the
> coming weeks — **not** the application (that's
> [DRS-0002](../stories/DRS-0002-app-scaffold.story.md)). `spdd-generate` implements the
> **Operations** in order. No application source code is created in this slice.

---

## R — Requirements

**Problem.** There is no repository foundation. Without one, every later slice re-litigates
git hygiene, formatting, commit discipline, dependency hygiene, CI, and deploys — slowly
and inconsistently. We need a deliberate, framework-agnostic foundation so quality is
enforced by the toolchain and the team can move fast and safely.

**In scope.**
- Git & editor hygiene; Node/pnpm baseline (Corepack-pinned).
- Prettier; commit quality gate (Husky + lint-staged + commitlint / Conventional Commits).
- Dependency automation (Renovate).
- Governance & docs: Apache-2.0 LICENSE, README, CONTRIBUTING (SPDD), SECURITY,
  CODEOWNERS, PR/issue templates, ADR log + seed ADRs.
- CI pipeline (format:check → lint → typecheck → test + commitlint), green on the
  app-less foundation state via documented placeholder scripts.
- Vercel project config (`vercel.json`, `.vercelignore`) and the env-var contract for
  the trunk-based + preview-deploy model.

**Out of scope (→ [DRS-0002](../stories/DRS-0002-app-scaffold.story.md)).**
- Next.js, `tsconfig`, `next.config`, Tailwind/design tokens, app shell & routes.
- `types/`, `lib/analytics`, `lib/db`, `lib/blob`, Vitest wiring, Next ESLint config,
  runtime env validation (zod schema).

**Definition of done.** Every
[story acceptance criterion](../stories/DRS-0001-repo-foundation.story.md#acceptance-criteria)
met: hygiene/baseline files present & valid; a non-conventional commit is rejected
locally; Renovate config valid; governance & ADR docs in place; CI green on a clean
checkout; `vercel.json` valid and the env contract + linking steps documented.

---

## A — Approach

Build the **framework-agnostic** platform now; let the app (DRS-0002) fill the
framework-coupled bodies. Three principles:

1. **Author pipelines once, correctly.** The CI workflow and commit gates are final from
   day one. Tools that need no app (Prettier, Husky, commitlint, Renovate) run *for real*
   immediately; app-coupled steps (lint/typecheck/test) call `package.json` scripts that
   are **documented placeholders** (`echo "pending DRS-0002"; exit 0`) until DRS-0002
   replaces the bodies. Only script bodies change later — never the pipeline shape.
2. **Deploys belong to Vercel, quality gates to GitHub Actions.** Trunk-based + previews
   *is* Vercel's native Git integration (PR → preview, merge `main` → production), so we
   ship `vercel.json` and document linking — **no GitHub deploy workflow**.
3. **Capture *why* in ADRs, *what/how* in canvases.** ADRs are the long-term decision log
   that complements the SPDD prompts.

Key decisions (see analysis): Renovate over Dependabot; Node 22 LTS via Corepack,
`engines.node >=20`; Husky v9 + lint-staged; env *contract* now, env *validation code*
in DRS-0002; `prompts/` & `docs/` kept in git but excluded from the deployed bundle.

Rejected: a deploy GitHub Action (Vercel does it natively); `continue-on-error` CI
(hides failure); deferring CI to DRS-0002 (CI shape is foundational); committing an
orphan zod env schema with no app to consume it.

---

## E — Entities

This slice operates in the **development domain**, not the race domain — it touches **no
entities** in [`../shared/entities.md`](../shared/entities.md). It instead realises the
governance halves of the canvas ([`norms`](../shared/norms.md),
[`safeguards`](../shared/safeguards.md)) as concrete configuration.

**Deltas to the shared model:** none.

---

## S — Structure

Files created (greenfield; **no `app/`, `lib/`, `types/`, or `components/` yet**):

```
# --- git & editor hygiene ---
.gitignore                       ← node_modules, .next, build out, coverage, .env*
                                   (keep .env.example), .vercel/, OS/editor cruft
.gitattributes                   ← * text=auto eol=lf; lockfiles & binaries marked
.editorconfig                    ← indent, charset=utf-8, eol=lf, final newline

# --- runtime & package manager baseline ---
.nvmrc                           ← 22  (Node 22 LTS)
.npmrc                           ← pnpm policy (e.g. engine-strict, peer-deps stance)
package.json                     ← "packageManager": "pnpm@<pinned>",
                                   "engines": { "node": ">=20" },
                                   scripts: dev/build/start (placeholder),
                                   lint/typecheck/test (placeholder → DRS-0002),
                                   format/format:check (real, via Prettier),
                                   prepare (husky install);
                                   devDeps: prettier, husky, lint-staged,
                                   @commitlint/{cli,config-conventional}
pnpm-lock.yaml                   ← committed lockfile

# --- formatting ---
.prettierrc                      ← shared Prettier config
.prettierignore                  ← pnpm-lock, .next, build, prompts snapshots if any

# --- commit quality gate ---
.husky/pre-commit                ← pnpm lint-staged
.husky/commit-msg                ← pnpm commitlint --edit "$1"
commitlint.config.cjs            ← extends @commitlint/config-conventional
# lint-staged config lives in package.json ("*": prettier --write; + eslint --fix in 0002)

# --- dependency automation ---
renovate.json                    ← extends config:recommended; group devDeps & actions;
                                   schedule; lockfile maintenance; pin pnpm/Node

# --- governance & docs ---
LICENSE                          ← Apache-2.0 full text
NOTICE                           ← attribution (if/when needed)
README.md                        ← what/why, setup, scripts, deploy, links to prompts/
CONTRIBUTING.md                  ← SPDD loop, dev setup, branch model, commits, PR flow
SECURITY.md                      ← vulnerability reporting contact/policy
.github/CODEOWNERS               ← default owners
.github/pull_request_template.md ← checklist incl. "canvas updated / in sync?"
.github/ISSUE_TEMPLATE/bug.md
.github/ISSUE_TEMPLATE/feature.md
.github/ISSUE_TEMPLATE/config.yml
docs/adr/0000-template.md        ← MADR-style template
docs/adr/0001-adopt-spdd.md
docs/adr/0002-tech-stack-nextjs-vercel.md
docs/adr/0003-persistence-vercel-postgres-blob.md
docs/adr/0004-trunk-based-with-vercel-previews.md
docs/adr/0005-node-pnpm-policy.md
docs/adr/README.md               ← index of ADRs

# --- CI ---
.github/workflows/ci.yml         ← on: pull_request + push to main;
                                   jobs: setup (pnpm + Node cache, frozen lockfile),
                                   format:check, lint, typecheck, test, commitlint(PR)

# --- Vercel & env contract ---
vercel.json                      ← framework: nextjs, region, installCommand,
                                   buildCommand (placeholders resolve once DRS-0002 lands)
.vercelignore                    ← prompts/, docs/, wohlen-race-analysis.html, *.md drafts
.env.example                     ← POSTGRES_URL / POSTGRES_* , BLOB_READ_WRITE_TOKEN
                                   (names + one-line purpose; NO values)
```

**Dependencies added (dev only):** `prettier`, `husky`, `lint-staged`,
`@commitlint/cli`, `@commitlint/config-conventional`. **No runtime/app deps** here —
those arrive with DRS-0002.

**Integration points:** GitHub (Actions, branch protection on `main`, CODEOWNERS-based
review); Vercel (project linked via native Git integration; env vars set per
environment); Renovate app installed on the repo.

---

## O — Operations

1. **Git & editor hygiene.** Create `.gitignore`, `.gitattributes`, `.editorconfig`.
   - *Acceptance:* `git status` shows no ignored junk; `.env`/`.vercel` never tracked;
     EOL normalised to LF.
2. **Runtime & PM baseline.** Add `.nvmrc` (22), `.npmrc`, and root `package.json` with
   `packageManager` (pinned pnpm), `engines.node`, the canonical script names (real
   `format`/`format:check`; placeholder `lint`/`typecheck`/`test` that `echo "pending
   DRS-0002"; exit 0`), and a `prepare` script. Generate `pnpm-lock.yaml`.
   - *Acceptance:* `corepack pnpm install` succeeds on the pinned versions; `pnpm
     format:check` runs for real; placeholder scripts exit 0 with a clear message.
3. **Formatting.** Add `.prettierrc` + `.prettierignore`; format the existing
   markdown/config.
   - *Acceptance:* `pnpm format:check` passes on a clean tree.
4. **Commit quality gate.** Install Husky (`prepare`), add `.husky/pre-commit`
   (lint-staged) and `.husky/commit-msg` (commitlint); add `commitlint.config.cjs` and
   the lint-staged entry in `package.json`.
   - *Acceptance:* a commit with a non-conventional subject (`"wip"`) is **rejected**;
     a conformant one (`"chore: …"`) passes; staged files are auto-formatted.
5. **Dependency automation.** Add `renovate.json` (extends `config:recommended`; group
   devDeps and GitHub Actions; schedule; `lockFileMaintenance`).
   - *Acceptance:* config validates (e.g. `npx --yes renovate-config-validator`).
6. **Governance & docs.** Add Apache-2.0 `LICENSE` (+ `NOTICE` if needed), `README.md`,
   `CONTRIBUTING.md` (SPDD loop + branch/commit model), `SECURITY.md`, `.github/CODEOWNERS`,
   PR template, issue templates, and `docs/adr/` (template + index + seed ADRs 0001–0005).
   - *Acceptance:* links resolve; ADRs state context/decision/consequences; README setup
     steps are runnable; PR template references the canvas-sync check.
7. **CI pipeline.** Add `.github/workflows/ci.yml`: cached pnpm/Node setup with frozen
   lockfile, then `format:check`, `lint`, `typecheck`, `test`, and commitlint on PR
   commits.
   - *Acceptance:* CI is **green** on a clean checkout in the app-less state (real
     format/commit checks pass; placeholder lint/type/test exit 0); workflow is valid.
8. **Vercel & env contract.** Add `vercel.json` and `.vercelignore`; write `.env.example`
   (names only); document the three Vercel environments, the env-var contract, and the
   one-time repo→Vercel linking + branch-protection steps in README/CONTRIBUTING.
   - *Acceptance:* `vercel.json` validates; `.vercelignore` excludes `prompts/`, `docs/`,
     and the prototype; linking + env steps are documented; no secrets committed.

---

## N — Norms (deltas only)
Inherits [`../shared/norms.md`](../shared/norms.md). Slice-specific:
- This slice **creates** the package-manager (pnpm/Corepack), formatting, and commit
  standards that `norms.md` assumes — treat those Norms as the target to realise.
- The project structure in `norms.md` (`app/`, `lib/`, `types/`) is **not** created here;
  it is established by DRS-0002. Do not scaffold empty app folders.
- Conventional Commits is the commit standard (commitlint-enforced).

## S — Safeguards (deltas only)
Inherits [`../shared/safeguards.md`](../shared/safeguards.md). Slice-specific:
- `.gitignore` **must** exclude `.env*` (except `.env.example`) and `.vercel/`; no
  secrets, tokens, or connection strings in git or in `vercel.json`.
- `.env.example` documents variable **names and purpose only** — never values.
- CI/build **must not** require a live database, Blob, or any secret; the foundation is
  fully verifiable on a clean checkout with no credentials.
- `.vercelignore` keeps `prompts/`, `docs/`, and the prototype HTML out of the deployed
  bundle (they are intent/reference, not the app) while remaining in version control.
- Placeholder CI scripts must be **loud** (`echo "pending DRS-0002"`) so a never-replaced
  placeholder is visible in logs, not silently green forever.

---

## Changelog
- 2026-06-30 — created from the split of the original "foundation & scaffold" story.
  This slice = repository & delivery foundation only; the Next.js application scaffold
  moved to [DRS-0002](../stories/DRS-0002-app-scaffold.story.md).
- 2026-06-30 — **approved** at the human review gate; ready for `spdd-generate`.
