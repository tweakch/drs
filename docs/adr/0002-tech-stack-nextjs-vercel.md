# ADR-0002: Tech stack — Next.js + TypeScript + Tailwind on Vercel

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** tweakch

## Context

The prototype is a client-only HTML file using Chart.js and inline styles. We want a
modern, deployable app with a strong hosting story, server-side capabilities (for
persistence and recompute), and a maintainable component model — while preserving the
prototype's dense, dark, data-first aesthetic.

## Decision

Build with **Next.js (App Router) + TypeScript (strict)** styled with **Tailwind CSS**,
deployed to **Vercel**. The analytics engine is isolated as a pure, framework-free module
(`lib/analytics/`). Charts continue to use Chart.js. Design tokens are ported from the
prototype's CSS variables into both `globals.css` and the Tailwind theme. (Implemented in
DRS-0002.)

## Consequences

**Positive**

- First-class Vercel integration (preview deploys, serverless/edge, env management).
- RSC + server actions enable server-side recompute and data access.
- TypeScript strict + a pure engine module make the core logic highly testable.

**Negative / trade-offs**

- App Router demands discipline around server/client component boundaries.
- Framework coupling; mitigated by keeping `lib/analytics/` framework-neutral.

## Alternatives considered

- **Vite + React SPA** — closer to the current client-only prototype but fewer
  Vercel-native capabilities and no built-in server runtime.
- **SvelteKit / Astro** — viable, but Next.js is the most first-class on Vercel and the
  team's default.
