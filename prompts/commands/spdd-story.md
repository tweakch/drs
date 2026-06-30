# spdd-story

**Step 1 of the SPDD loop.** Turn a raw requirement into one or more INVEST-compliant
user stories.

## When to run
At the start of a new slice, or to split a large requirement into shippable pieces.

## Inputs
- A raw feature request or goal.
- Context: [`../README.md`](../README.md), [`../shared/entities.md`](../shared/entities.md),
  the prototype `../../wohlen-race-analysis.html`.

## Instructions to the agent
1. Restate the requirement in one sentence. If it's too big for one slice, split it
   into independent INVEST stories and list them; pick or confirm which to do first.
2. Allocate the next free `DRS-NNNN` id (check `../stories/`).
3. Write `../stories/DRS-NNNN-<slug>.story.md` from
   [`../stories/_TEMPLATE.story.md`](../stories/_TEMPLATE.story.md):
   - Story (As a / I want / so that), context, acceptance criteria.
   - Fill the INVEST check honestly — if it fails "Small" or "Independent", split.
   - List out-of-scope items and open questions.
4. Do **not** design implementation here — keep it at the requirement altitude.

## Output
A story file with `status: draft`. Then stop — the **human clarify gate (step 2)**
comes next: a person reviews scope and answers open questions before analysis.
