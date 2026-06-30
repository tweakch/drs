---
description: 'SPDD step 4 — produce the executable REASONS Canvas (the build blueprint).'
argument-hint: '<story/analysis id or slice slug, e.g. DRS-0001>'
---

You are running the **spdd-reasons-canvas** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-reasons-canvas.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…` from the repo root). Paths the spec tells you
> to _write into_ an artifact's front-matter (e.g. `source_story`/`source_analysis:
../…`) stay relative to that artifact's own folder — leave those `../`.

Supporting context (read what the spec references):

- Canvas template: @prompts/canvas/_TEMPLATE.reasons-canvas.md
- Workflow & gates: @prompts/WORKFLOW.md
- Naming / IDs / front-matter: @prompts/conventions.md
- Shared: `prompts/shared/entities.md`, `prompts/shared/norms.md`, `prompts/shared/safeguards.md`

**Slice / input for this run:** $ARGUMENTS

Fill every REASONS part. Reference shared context and capture only deltas. Then STOP —
the human review gate comes next. Do not generate code until the Canvas is `approved`.
