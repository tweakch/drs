---
description: "SPDD step 1 — turn a raw requirement into INVEST user stories."
argument-hint: "<raw feature request or goal>"
---
You are running the **spdd-story** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-story.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…`, `../../wohlen-race-analysis.html` →
> `wohlen-race-analysis.html` from the repo root). Paths the spec tells you to *write
> into* an artifact's front-matter (e.g. `source_story: ../stories/…`) stay relative to
> that artifact's own folder — leave those `../`.

Supporting context (read what the spec references; do not duplicate it):
- Workflow & gates: @prompts/WORKFLOW.md
- Naming / IDs / front-matter: @prompts/conventions.md
- Domain model: `prompts/shared/entities.md`

**Input for this run:** $ARGUMENTS

Stay at requirement altitude — no implementation design. Stop at the human clarify
gate (step 2) once the story file is drafted.
