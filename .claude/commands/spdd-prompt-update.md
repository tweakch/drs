---
description: 'SPDD sync (prompt-first) — logic correction: fix the prompt, then regenerate.'
argument-hint: '<slice id> — what behaviour/requirement changed'
---

You are running the **spdd-prompt-update** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-prompt-update.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…` from the repo root). Paths the spec tells you
> to _write into_ an artifact's front-matter stay relative to that artifact's own
> folder — leave those `../`.

Supporting context (read what the spec references):

- Workflow & two-way sync rule: @prompts/WORKFLOW.md
- Naming / changelog / front-matter: @prompts/conventions.md
- Shared: `prompts/shared/entities.md`, `prompts/shared/norms.md`, `prompts/shared/safeguards.md`

**Slice + change description for this run:** $ARGUMENTS

This is the prompt-first direction: requirements/business rules changed or behaviour is
wrong. Update the Canvas (and story if scope shifts), bump `updated`, append a changelog
entry. Regenerate affected code only after human review marks it `approved`.
