---
id: DRS-NNNN
slice: <slug>
type: canvas
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_story: ../stories/DRS-NNNN-<slug>.story.md
source_analysis: ../analysis/DRS-NNNN-YYYYMMDD-analysis-<slug>.md
---

# REASONS Canvas — DRS-NNNN · <Title>

> The executable blueprint for this slice. `spdd-generate` reads this top-to-bottom
> and implements the **Operations** strictly. Keep it in sync with the code
> (`spdd-prompt-update` for logic changes, `spdd-sync` after refactors).

---

## R — Requirements
*Problem definition and definition of done.*

**Problem.** <what user/business need this slice solves>

**In scope.**
- <…>

**Out of scope.**
- <…>

**Definition of done.**
- [ ] <observable, checkable outcome>

---

## E — Entities
*Domain entities and relationships involved in this slice.*

References [`../shared/entities.md`](../shared/entities.md). This slice touches:
- <Entity> — <how it's used / what's new>

**Deltas to the shared model:** <new fields/entities, or "none">

---

## A — Approach
*Strategy for meeting the requirements (the "how", at design altitude).*

<the chosen approach, key decisions, and alternatives rejected and why>

---

## S — Structure
*Where the changes fit: components, files, dependencies.*

Files created / changed:
- `path/to/file` — <responsibility>

Dependencies added: <packages, or "none">
Integration points: <APIs, DB tables, env vars>

---

## O — Operations
*The approach broken into concrete, ordered, testable steps. This is what gets built.*

1. **<step>** — <what to do>
   - Acceptance: <how we know it's right>
2. **<step>** …

---

## N — Norms (deltas only)
Inherits [`../shared/norms.md`](../shared/norms.md). Slice-specific additions:
- <…or "none">

---

## S — Safeguards (deltas only)
Inherits [`../shared/safeguards.md`](../shared/safeguards.md). Slice-specific additions:
- <…or "none">

---

## Changelog
- YYYY-MM-DD — created.
