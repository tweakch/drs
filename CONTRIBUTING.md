# Contributing to DRS

Thanks for working on DRS. This repo uses **Structured-Prompt-Driven Development
(SPDD)** — the prompt is the source of intent, the code is derived from it. Read this
before opening a PR.

## Dev setup

```bash
nvm use            # Node 22 (.nvmrc)
corepack enable    # activates the pinned pnpm
pnpm install       # installs deps + Husky hooks (via "prepare")
```

You're set up correctly when a `git commit` triggers lint-staged formatting and rejects
a non-conventional commit message.

## The SPDD loop

Full details in [`prompts/WORKFLOW.md`](./prompts/WORKFLOW.md). In short, each slice:

1. **Story** — `/spdd-story` → `prompts/stories/DRS-NNNN-*.story.md`
2. **Clarify** (human gate) — lock scope.
3. **Analysis** — `/spdd-analysis DRS-NNNN`
4. **REASONS Canvas** — `/spdd-reasons-canvas DRS-NNNN`, then human review → `approved`.
5. **Generate** — `/spdd-generate DRS-NNNN` (only from an approved canvas).
6. **Tests** — derived from the canvas Operations.

**The golden rule:** _when reality diverges, fix the prompt first._

- Behaviour/requirements change (logic) → update the canvas with `/spdd-prompt-update`,
  then regenerate code.
- Pure refactor (behaviour unchanged) → change code, then `/spdd-sync` the canvas.

Commit prompts together with the code they produce so review sees intent + implementation.

## Branching & PRs

Trunk-based development:

- `main` is protected and always deployable. **Never commit directly to `main`.**
- Branch per slice/change: `feat/DRS-NNNN-<slug>`, `fix/<slug>`, `chore/<slug>`, etc.
- Open a PR → CI runs and Vercel publishes a **preview** deploy. Merge → **production**.
- Fill in the PR template, including the **SPDD sync check**.

## Commit messages — Conventional Commits

Format: `type(scope): subject`, e.g. `feat(race): add gap-to-leader column`.

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`,
`perf`, `style`. Enforced locally (`commit-msg` hook) and in CI. This keeps history
machine-readable and pairs with Renovate's grouped updates.

## Quality

Before pushing:

```bash
pnpm format:check
pnpm lint        # real once DRS-0002 lands
pnpm typecheck   # real once DRS-0002 lands
pnpm test        # real once DRS-0002 lands
```

Never commit secrets — `.env*` is git-ignored (except `.env.example`). Validate external
input at boundaries; recompute derived values server-side (see
[`prompts/shared/safeguards.md`](./prompts/shared/safeguards.md)).

## License headers

This project is Apache-2.0. Contributions are accepted under the same license (Apache-2.0
§5). You don't need a per-file header, but if you add one, use the standard short form:

```
Copyright 2026 tweakch
SPDX-License-Identifier: Apache-2.0
```

## Architecture decisions

Material decisions get an ADR in [`docs/adr/`](./docs/adr/) — copy
`0000-template.md`, number it next, and link it from the PR. ADRs capture _why_;
canvases capture _what/how_.
