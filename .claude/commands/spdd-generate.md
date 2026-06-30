---
description: 'SPDD step 5 — generate code from an approved REASONS Canvas.'
argument-hint: '<canvas id or slice slug, e.g. DRS-0001>'
---

You are running the **spdd-generate** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-generate.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…` from the repo root). Paths the spec tells you
> to _write into_ an artifact's front-matter stay relative to that artifact's own
> folder — leave those `../`.

Supporting context (read what the spec references):

- Engineering standards: `prompts/shared/norms.md`
- Non-negotiable boundaries: `prompts/shared/safeguards.md`
- Workflow & sync rule: @prompts/WORKFLOW.md

**Approved Canvas / input for this run:** $ARGUMENTS

Implement Operations task-by-task, in order. Obey every Norm and Safeguard. If the
Canvas is wrong or missing a detail, STOP and fix the prompt first
(`/spdd-prompt-update`) — do not silently diverge.
