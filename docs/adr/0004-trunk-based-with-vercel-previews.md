# ADR-0004: Trunk-based development with Vercel preview deploys

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** tweakch

## Context

We need a simple, fast delivery model that fits a small team and Vercel's strengths, with
clear separation between quality enforcement and deployment.

## Decision

Adopt **trunk-based development**: `main` is protected and always deployable; all work
lands via short-lived PR branches. Deployment uses **Vercel's native Git integration** —
every PR gets a **preview** deploy, and merging to `main` promotes to **production**.
**GitHub Actions owns quality gates** (format/lint/typecheck/test + commitlint);
**Vercel owns deploys** — there is intentionally **no GitHub deploy workflow**.

## Consequences

**Positive**

- Minimal ceremony; fast feedback via per-PR previews.
- Clean separation of concerns (CI = gates, Vercel = deploys).
- `main` stays releasable.

**Negative / trade-offs**

- Requires branch protection + green CI to prevent breakage on `main`.
- No long-lived staging branch; preview deploys serve that role.

## Alternatives considered

- **Gitflow (develop + main)** — more ceremony than a small team needs; previews already
  provide pre-prod verification.
- **Deploy from GitHub Actions via Vercel CLI** — duplicates what Vercel's Git
  integration does natively; more moving parts.
