---
description: "SPDD optional — generate API validation scripts for a slice with an HTTP surface."
argument-hint: "<canvas id or slice slug exposing endpoints>"
---
You are running the **spdd-api-test** step of this repo's Structured-Prompt-Driven Development loop.

Execute the canonical command specification exactly as written:

@prompts/commands/spdd-api-test.md

> **Path note:** `../`-relative links in that spec are relative to `prompts/commands/`
> (e.g. `../shared/…` → `prompts/shared/…` from the repo root). Paths the spec tells you
> to *write into* an artifact's front-matter stay relative to that artifact's own
> folder — leave those `../`.

Supporting context (read what the spec references):
- Boundary limits & validation: `prompts/shared/safeguards.md`
- Workflow: @prompts/WORKFLOW.md

**Slice / input for this run:** $ARGUMENTS

Cover happy path, validation failures, and safeguard boundary limits. Annotate expected
results inline so the script doubles as documentation. Findings that reveal a spec
problem → fix the prompt first (`/spdd-prompt-update`).
