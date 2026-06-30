# DRS — kart-race After-Action Review

DRS turns raw endurance-kart timing into an after-action review: per-driver and
per-kart pace decomposition, stint analysis, a live race replay, and what-if
("virtual") scenarios. It begins life as a single-file prototype
(`wohlen-race-analysis.html`) and is being rebuilt as a modern web app on Vercel.

> **Status:** repository & delivery foundation (slice **DRS-0001**). The Next.js
> application itself arrives in **DRS-0002**. Until then, the app scripts are
> intentional placeholders — see [Scripts](#scripts).

## How we build: SPDD

Development follows **Structured-Prompt-Driven Development (SPDD)** — prompts are
first-class, version-controlled artifacts, and _when reality diverges we fix the prompt
first, then the code_. The whole workflow, the REASONS Canvas, and every slice's
story/analysis/canvas live in [`prompts/`](./prompts/). Start at
[`prompts/README.md`](./prompts/README.md) and [`prompts/WORKFLOW.md`](./prompts/WORKFLOW.md).

Architecture decisions are recorded in [`docs/adr/`](./docs/adr/).

## Tech stack (target)

| Concern         | Choice                                                 |
| --------------- | ------------------------------------------------------ |
| Framework       | Next.js (App Router) + TypeScript — _DRS-0002_         |
| Styling         | Tailwind CSS (design tokens ported from the prototype) |
| Hosting         | Vercel (trunk-based, preview deploy per PR)            |
| Database        | Vercel Postgres (race / team / lap)                    |
| Large payloads  | Vercel Blob (raw timing dumps, exports)                |
| Package manager | pnpm (via Corepack), Node 22 LTS                       |

## Getting started

```bash
# 1. Use the pinned Node version (22, see .nvmrc). Pick your version manager:
#    nvm-sh (macOS/Linux):  nvm install && nvm use       # auto-reads .nvmrc
#    nvm-windows:           nvm install 22 && nvm use 22  # does NOT read .nvmrc
#    fnm:                   fnm use --install-on-empty    # auto-reads .nvmrc
#    Volta:                 auto-detected; nothing to run
node -v                      # expect v22.x

# 2. Activate the pinned pnpm via Corepack (adds `pnpm` to PATH; needed for hooks)
corepack enable

# 3. Install dependencies (sets up Husky git hooks via the "prepare" script)
pnpm install

# 4. Formatting / quality
pnpm format          # write
pnpm format:check    # verify
```

> **Note for nvm-windows users:** `nvm use` with no argument fails with _"A version
> argument is required but missing"_ — only nvm-sh reads `.nvmrc`. Always pass the
> version: `nvm use 22`.

`lint`, `typecheck`, `test`, `dev`, `build`, and `start` are placeholders today and
become real commands in DRS-0002.

## Scripts

| Script               | Now (DRS-0001)            | After DRS-0002       |
| -------------------- | ------------------------- | -------------------- |
| `pnpm format`        | Prettier write (real)     | unchanged            |
| `pnpm format:check`  | Prettier check (real)     | unchanged            |
| `pnpm lint`          | prints "pending DRS-0002" | ESLint / `next lint` |
| `pnpm typecheck`     | prints "pending DRS-0002" | `tsc --noEmit`       |
| `pnpm test`          | prints "pending DRS-0002" | Vitest               |
| `pnpm dev` / `build` | prints "pending DRS-0002" | Next.js dev / build  |

## Quality gates

- **Prettier** — formatting, enforced in CI (`format:check`).
- **Husky + lint-staged** — staged files auto-formatted on `pre-commit`.
- **commitlint** — commit messages must follow
  [Conventional Commits](https://www.conventionalcommits.org/); enforced on
  `commit-msg` and in CI on PRs.
- **GitHub Actions** ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) — runs
  the quality gates on every PR and push to `main`.
- **Renovate** — automated, grouped dependency updates.

## Branching & deploys

Trunk-based: `main` is always deployable and protected. Open a PR → Vercel builds a
**preview** deploy; merge to `main` → Vercel promotes to **production**. GitHub Actions
owns quality gates; Vercel owns deploys (its native Git integration — there is no deploy
workflow in this repo). See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full flow and
[ADR-0004](./docs/adr/0004-trunk-based-with-vercel-previews.md).

### One-time Vercel setup

1. Create a Vercel project and link it to this repository (Vercel dashboard → Add New →
   Project → import the Git repo). Vercel auto-detects `vercel.json`.
2. Add a Vercel Postgres store and a Blob store; "connect" them to the project so the
   `POSTGRES_*` and `BLOB_READ_WRITE_TOKEN` env vars are populated for
   Development / Preview / Production. See [`.env.example`](./.env.example) for the names.
3. Protect `main` (GitHub → Settings → Branches): require the CI checks to pass before
   merge. (Code-owner review is optional today — see `.github/CODEOWNERS`.)

## Repository layout

```
prompts/        SPDD artifacts — stories, analyses, REASONS canvases, shared context
docs/adr/       Architecture Decision Records
.github/        CI workflow, CODEOWNERS, PR & issue templates
.husky/         git hooks (pre-commit, commit-msg)
.claude/        Claude Code slash commands for the SPDD steps
wohlen-race-analysis.html   the original prototype (reference)
```

(`app/`, `lib/`, `types/`, `components/` arrive with the application in DRS-0002.)

## License

[Apache-2.0](./LICENSE) © 2026 tweakch. See also [`NOTICE`](./NOTICE).
