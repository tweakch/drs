# ADR-0005: Node & pnpm version policy

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** tweakch

## Context

Reproducible installs across developer machines, CI, and Vercel require pinning the
runtime and the package manager. Drift in Node or pnpm versions causes "works on my
machine" failures and lockfile churn.

## Decision

- **Node 22 LTS** is the target, pinned via [`.nvmrc`](../../.nvmrc) and consumed by CI
  (`actions/setup-node` with `node-version-file`). `package.json#engines.node` is set to
  `>=20` for tolerance, with `engine-strict=true` in `.npmrc` to fail fast on an
  unsupported runtime.
- **pnpm** is the package manager, pinned exactly via `package.json#packageManager`
  (`pnpm@11.9.0`) and activated through **Corepack** — no global pnpm install required.
- The committed `pnpm-lock.yaml` is the source of truth; CI and Vercel install with
  `--frozen-lockfile`. Renovate keeps Node, pnpm, and dependencies current.

## Consequences

**Positive**

- Deterministic installs everywhere; no manual pnpm setup.
- Fast, disk-efficient installs (pnpm).

**Negative / trade-offs**

- Corepack must be enabled once per machine (`corepack enable`).
- Exact pnpm pin needs periodic bumps (automated via Renovate).

## Alternatives considered

- **npm / yarn** — pnpm is faster and stricter about phantom dependencies.
- **Unpinned versions** — simplest, but reintroduces the drift this ADR prevents.
