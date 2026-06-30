---
id: DRS-0001
slice: repo-foundation
type: story
status: approved
created: 2026-06-30
updated: 2026-06-30
supersedes: DRS-0001-foundation-scaffold (split into DRS-0001 repo-foundation + DRS-0002 app-scaffold)
---

# DRS-0001 · Repository & delivery foundation

## Story

**As the** developers who will live in this repository for the coming weeks
**I want** a deliberate, framework-agnostic repository and delivery foundation — git
hygiene, Node/pnpm baseline, formatting and commit quality gates, dependency
automation, governance & contribution docs (incl. ADRs and the SPDD workflow), CI, and
the Vercel project wiring (trunk-based with preview deploys)
**so that** every subsequent slice lands in a clean, automated, low-friction repo where
quality is enforced by the toolchain rather than by memory.

## Context

This slice was split out of the original "foundation & scaffold" story. We deliberately
**separate the repository/delivery foundation from the application scaffold** so the
foundation gets its own thought, review, and clean canvas — it is not a side-effect of
spinning up Next.js. The Next.js app (shell, design tokens, analytics boundary, data
layer) is now [DRS-0002](./DRS-0002-app-scaffold.story.md) and builds _on top of_ this.

The guiding lens: **what makes us efficient and safe in this repo for weeks?** Not the
app's features — the platform we develop them on.

## Acceptance criteria

**Git & editor hygiene**

- [ ] `.gitignore` excludes `node_modules`, `.next`, build output, coverage, `.env*`
      (except `.env.example`), `.vercel/`, OS/editor cruft.
- [ ] `.gitattributes` normalizes line endings (LF) and marks lockfiles/binaries.
- [ ] `.editorconfig` sets shared indent/charset/EOL/final-newline.

**Runtime & package manager baseline**

- [ ] Node version pinned (`.nvmrc`) and enforced via `package.json#engines`.
- [ ] pnpm pinned via Corepack (`packageManager` field); `.npmrc` captures pnpm policy.
- [ ] Root `package.json` exists with tooling devDependencies and the canonical script
      names the app will fill in (`lint`, `typecheck`, `test`, `format`, `format:check`).

**Code style & commit quality gates**

- [ ] Prettier configured (`.prettierrc`, `.prettierignore`) — framework-agnostic.
- [ ] Husky installed; `pre-commit` runs lint-staged (format staged files);
      `commit-msg` runs commitlint (Conventional Commits).
- [ ] commitlint config present; a non-conventional commit message is rejected locally.

**Dependency automation**

- [ ] Renovate configured (`renovate.json`) with grouped, scheduled PRs, incl. GitHub
      Actions and pnpm; lockfile maintenance enabled.

**Governance & contribution docs**

- [ ] `LICENSE` = Apache-2.0; `package.json#license` matches; `NOTICE` if required.
- [ ] Root `README.md` (what/why, setup, scripts, deploy, links to `prompts/` SPDD).
- [ ] `CONTRIBUTING.md` documents the SPDD loop, dev setup, branch model, commit
      convention, and the PR flow.
- [ ] `SECURITY.md` with a vulnerability-reporting contact.
- [ ] `.github/CODEOWNERS`, PR template, and issue templates (bug + feature) present.
- [ ] `docs/adr/` with an ADR template and seed ADRs (SPDD adoption, stack, persistence,
      trunk-based + Vercel previews, Node/pnpm policy).

**CI**

- [ ] `.github/workflows/ci.yml` runs on PRs and pushes to `main`: install (cached) →
      format:check → lint → typecheck → test, plus commitlint on PR commits.
- [ ] CI is **green on the foundation state** (jobs that need the app pass trivially
      until DRS-0002 fills the scripts) — see analysis for the placeholder strategy.

**Vercel & delivery model**

- [ ] `vercel.json` (framework, region, install/build commands) and `.vercelignore`
      (excludes `prompts/`, the prototype HTML, `docs/`).
- [ ] Trunk-based model documented: protected `main`, PR → preview deploy, merge →
      production. Vercel project linked via native Git integration.
- [ ] `.env.example` documents required env var **names** (Postgres, Blob); the env-var
      contract and the three Vercel environments (Development/Preview/Production) are
      documented. (Runtime env _validation_ code lands with the app in DRS-0002.)

## INVEST check

- **Independent** — yes; pure repo/delivery scaffolding, depends on nothing.
- **Negotiable** — depth of ADRs, Renovate cadence, optional governance files can flex.
- **Valuable** — compounding: every later slice is faster and safer because of it.
- **Estimable** — yes; well-understood, if broad.
- **Small** — bounded to "everything that is not the running app"; the app is DRS-0002.
- **Testable** — files present & valid; hooks reject bad commits; CI green; preview
  deploys on PR.

## Out of scope (→ DRS-0002 app scaffold)

- Next.js project, `tsconfig`, `next.config`, Tailwind, design tokens.
- App shell, routes, placeholder views.
- `types/`, `lib/analytics` boundary, `lib/db` / `lib/blob`, Vitest test setup wiring,
  ESLint (next config), runtime env validation (zod schema).

## Open questions (resolved at clarify gate)

- Split foundation from scaffold? → **yes, split** (decided).
- DX tooling set? → **commit gate + Renovate + ADRs/CONTRIBUTING + governance files**.
- Git/deploy model? → **trunk-based + Vercel previews** (decided).
- License? → **Apache-2.0** (decided).
- Node version? → **pin Node 22 LTS, `engines: >=20`** (assumed; adjust if needed).
- Renovate vs Dependabot? → **Renovate** (richer grouping/scheduling; assumed).
