# spdd-reasons-canvas

**Step 4 of the SPDD loop.** Produce the executable REASONS Canvas — the blueprint
code is generated from.

## When to run

After analysis (step 3) is done.

## Inputs

- The story and analysis for this slice.
- The shared context: [`entities`](../shared/entities.md), [`norms`](../shared/norms.md),
  [`safeguards`](../shared/safeguards.md).

## Instructions to the agent

Fill every part of [`../canvas/_TEMPLATE.reasons-canvas.md`](../canvas/_TEMPLATE.reasons-canvas.md):

- **R — Requirements**: problem, in/out of scope, a checkable Definition of Done.
- **E — Entities**: reference `shared/entities.md`; list only the entities this slice
  touches and any **deltas** (new fields/entities). If you add a delta, also update
  `shared/entities.md` in the same change.
- **A — Approach**: the design-altitude strategy and the key decisions (pull from
  analysis). Note rejected alternatives.
- **S — Structure**: exact files to create/change, dependencies to add, integration
  points (DB tables, env vars, APIs).
- **O — Operations**: ordered, concrete, **testable** steps. Each step has an
  acceptance line. This is the contract `spdd-generate` implements — be precise.
- **N — Norms**: reference `shared/norms.md`; list only deltas.
- **S — Safeguards**: reference `shared/safeguards.md`; list only deltas. Never loosen
  a shared safeguard without an explicit, signed-off note.

Write `../canvas/DRS-NNNN-YYYYMMDD-canvas-<slug>.md`, link the source story & analysis
in the front-matter, set `status: draft`.

## Output

A complete Canvas. Then stop — the **human review gate** comes next. Do not generate
code until the Canvas is `approved`.
