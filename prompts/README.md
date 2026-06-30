# DRS — Structured-Prompt-Driven Development

This directory holds the **structured prompts** that drive development of DRS, the
kart-race After-Action Review web app. We follow **SPDD** (Structured-Prompt-Driven
Development) as described by Thoughtworks / Martin Fowler:
<https://martinfowler.com/articles/structured-prompt-driven/>.

The guiding rule of SPDD:

> **Prompts are first-class, version-controlled delivery artifacts.**
> When reality diverges, **fix the prompt first — then update the code.**

The prompt is the source of intent. The code is a derivative of it. Both are kept in
sync (see [`WORKFLOW.md`](./WORKFLOW.md)).

---

## What we're building

The prototype is a single 3,000-line HTML file (`../wohlen-race-analysis.html`): a
self-contained "After-Action Review engine" for endurance kart racing (2h GP at
Kartbahn Wohlen). It has nine views over one race — Data, Director, Product, Race,
Team, Driver, Kart, Detektiv, Replay — an analytics core that decomposes lap times
into per-driver and per-kart effects, a live SVG race replay, and a "virtual mode"
for what-if scenarios.

We are turning it into a **modern, production web app**:

| Concern        | Decision                                               |
| -------------- | ------------------------------------------------------ |
| Framework      | Next.js (App Router) + TypeScript                      |
| Styling        | Tailwind CSS (design tokens ported from the prototype) |
| Hosting        | Vercel (first-class integration)                       |
| Database       | Vercel Postgres (relational race/team/lap model)       |
| Large payloads | Vercel Blob (raw timing dumps, exports)                |
| Charts         | Chart.js (already used in the prototype)               |

The foundation work is split into two deliberate slices: **DRS-0001 repository &
delivery foundation** (git hygiene, tooling, commit gates, CI, governance/ADRs, Vercel
wiring — the platform we live in) and **DRS-0002 app scaffold** (Next.js shell, design
tokens, domain types, the pure analytics boundary, env-gated data layer). Feature views
come in later canvases, incrementally.

---

## The REASONS Canvas

Every feature is specified as a **REASONS Canvas** before code is generated. Seven
parts, grouped by purpose:

**Intent & Design (abstract)**

- **R — Requirements** — problem definition and definition of done
- **E — Entities** — domain entities and their relationships
- **A — Approach** — strategy for meeting the requirements
- **S — Structure** — where changes fit; components and dependencies

**Execution (specific)**

- **O — Operations** — the approach broken into concrete, testable steps

**Governance (common standards)**

- **N — Norms** — cross-cutting engineering standards
- **S — Safeguards** — non-negotiable boundaries (invariants, perf, security)

Norms and Safeguards are largely **shared across canvases** and live in
[`shared/`](./shared/); individual canvases reference them and add only deltas.

---

## Directory layout

```
prompts/
├── README.md                  ← you are here
├── WORKFLOW.md                ← the 6-step loop + two-way sync rules
├── conventions.md             ← naming, IDs, file patterns
│
├── shared/                    ← reused across every canvas
│   ├── entities.md            ← E — the living domain model (glossary)
│   ├── norms.md               ← N — engineering standards
│   └── safeguards.md          ← S — non-negotiable boundaries
│
├── commands/                  ← the SPDD step prompts (each wrapped as a /spdd-* slash command)
│   ├── spdd-story.md
│   ├── spdd-analysis.md
│   ├── spdd-reasons-canvas.md
│   ├── spdd-generate.md
│   ├── spdd-prompt-update.md
│   ├── spdd-sync.md
│   └── spdd-api-test.md
│
├── stories/                   ← INVEST user stories (one slice each)
│   ├── _TEMPLATE.story.md
│   ├── DRS-0001-repo-foundation.story.md
│   └── DRS-0002-app-scaffold.story.md
│
├── analysis/                  ← strategic analysis per story
│   ├── _TEMPLATE.analysis.md
│   └── DRS-0001-20260630-analysis-repo-foundation.md
│
├── canvas/                    ← the executable REASONS Canvases
│   ├── _TEMPLATE.reasons-canvas.md
│   └── DRS-0001-20260630-canvas-repo-foundation.md
│
└── tests/                     ← test-intent prompts (regression net)
    └── _TEMPLATE.test.md
```

Each `commands/spdd-*.md` spec is also registered as a Claude Code slash command in
`.claude/commands/` (repo root), so you run a step with `/spdd-<step>` rather than
pasting the file. The spec under `commands/` stays the single source of truth; the
slash command is a thin wrapper that loads it and forwards your arguments.

---

## Quickstart

1. Read [`WORKFLOW.md`](./WORKFLOW.md) to understand the loop.
2. Skim the shared context: [`shared/entities.md`](./shared/entities.md),
   [`shared/norms.md`](./shared/norms.md), [`shared/safeguards.md`](./shared/safeguards.md).
3. The first slice (DRS-0001 repository & delivery foundation) is worked end-to-end
   (see each file's `status`):
   - Story → [`stories/DRS-0001-repo-foundation.story.md`](./stories/DRS-0001-repo-foundation.story.md)
   - Analysis → [`analysis/DRS-0001-20260630-analysis-repo-foundation.md`](./analysis/DRS-0001-20260630-analysis-repo-foundation.md)
   - Canvas → [`canvas/DRS-0001-20260630-canvas-repo-foundation.md`](./canvas/DRS-0001-20260630-canvas-repo-foundation.md)
   - Next slice drafted → [`stories/DRS-0002-app-scaffold.story.md`](./stories/DRS-0002-app-scaffold.story.md)
4. Once the canvas is `approved`, generate code by running `/spdd-generate DRS-0001`
   (the slash command wraps [`commands/spdd-generate.md`](./commands/spdd-generate.md)).
5. For the next slice, run `/spdd-analysis DRS-0002` → `/spdd-reasons-canvas DRS-0002`,
   then walk the loop. For brand-new work, start with `/spdd-story <requirement>`.
