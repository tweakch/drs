---
description: "SPDD step 3 — strategic analysis that frames the REASONS Canvas."
argument-hint: "<story id or @path, e.g. DRS-0001 or @prompts/stories/...>"
---
You are running the **spdd-analysis** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-analysis.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…`, `../../wohlen-race-analysis.html` →
> `wohlen-race-analysis.html` from the repo root). Paths the spec tells you to *write
> into* an artifact's front-matter (e.g. `source_story: ../stories/…`) stay relative to
> that artifact's own folder — leave those `../`.

Supporting context (read what the spec references):
- Workflow & gates: @prompts/WORKFLOW.md
- Naming / IDs / front-matter: @prompts/conventions.md
- Shared: `prompts/shared/entities.md`, `prompts/shared/norms.md`, `prompts/shared/safeguards.md`
- Source of truth prototype: `wohlen-race-analysis.html`

**Story / input for this run:** $ARGUMENTS

Keep it strategic (the "What" and "Why") — no code, no full Canvas. Write the analysis
file with `status: draft`.
