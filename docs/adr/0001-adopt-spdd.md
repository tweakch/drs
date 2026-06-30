# ADR-0001: Adopt Structured-Prompt-Driven Development (SPDD)

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** tweakch

## Context

DRS starts as a 3,000-line single-file prototype and will be rebuilt as a production web
app, largely with AI assistance. Ad-hoc prompting produces drift between intent and code
and leaves no reviewable record of _why_ the code is shaped as it is. We want AI-assisted
development to be governed, reviewable, and reproducible.

## Decision

Adopt **Structured-Prompt-Driven Development** as described by Thoughtworks / Martin
Fowler (<https://martinfowler.com/articles/structured-prompt-driven/>). Prompts are
first-class, version-controlled artifacts. Each slice flows through
story → analysis → REASONS Canvas → generate → test, with human gates at clarify and
canvas review. The rule **"when reality diverges, fix the prompt first"** governs sync:
logic changes update the canvas then regenerate; refactors change code then sync the
canvas. All artifacts live in [`prompts/`](../../prompts/).

## Consequences

**Positive**

- Intent is explicit and reviewable before code exists; less rework.
- Canvases + ADRs form durable project memory.
- Onboarding and AI runs are reproducible from the same artifacts.

**Negative / trade-offs**

- Up-front overhead per slice (story/analysis/canvas) before code.
- Requires discipline to keep prompts and code in sync.

## Alternatives considered

- **Ad-hoc prompting / vibe-coding** — fastest to start, but drift-prone and unreviewable.
- **Traditional spec docs without the sync rule** — specs rot once code diverges; SPDD's
  bidirectional sync is the key improvement.
