# spdd-analysis

**Step 3 of the SPDD loop.** Produce the strategic analysis that frames the Canvas.

## When to run

After a story's scope is locked at the human clarify gate (step 2).

## Inputs

- The approved story `../stories/DRS-NNNN-<slug>.story.md`.
- [`../shared/entities.md`](../shared/entities.md), [`../shared/norms.md`](../shared/norms.md),
  [`../shared/safeguards.md`](../shared/safeguards.md).
- The prototype `../../wohlen-race-analysis.html` and any existing app code.

## Instructions to the agent

1. Extract **domain keywords** from the story and map each to an entity/term in
   `entities.md`. Flag any term that isn't modelled yet.
2. **Scan the source of truth**: find the prototype view(s) and functions that
   implement (or inspire) this slice; cite function names / line ranges. List any
   existing app files the slice will touch.
3. Surface **key decisions & trade-offs** with a recommendation each.
4. List **risks/unknowns** with mitigations.
5. Draft a **suggested Operations outline** (ordered steps) — the seed for the Canvas.
6. Write `../analysis/DRS-NNNN-YYYYMMDD-analysis-<slug>.md` from
   [`../analysis/_TEMPLATE.analysis.md`](../analysis/_TEMPLATE.analysis.md).

## Output

An analysis file with `status: draft`. Keep it strategic — no code, no full Canvas yet.
