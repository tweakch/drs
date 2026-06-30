---
description: 'SPDD sync (code-first) — bring the Canvas back in line after a refactor.'
argument-hint: '<slice id whose code was refactored>'
---

You are running the **spdd-sync** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-sync.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…` from the repo root). Paths the spec tells you
> to _write into_ an artifact's front-matter stay relative to that artifact's own
> folder — leave those `../`.

Supporting context (read what the spec references):

- Workflow & two-way sync rule: @prompts/WORKFLOW.md
- Naming / changelog / front-matter: @prompts/conventions.md
- Shared: `prompts/shared/entities.md`, `prompts/shared/norms.md`

**Refactored slice for this run:** $ARGUMENTS

This is the code-first direction: structure improved, observable behaviour unchanged.
Update the Canvas's Structure/Operations to match the code, bump `updated`, append a
changelog entry, set `status: synced`. If behaviour actually changed, switch to
`/spdd-prompt-update` instead.
