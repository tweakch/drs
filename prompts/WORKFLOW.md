# SPDD Workflow

The closed loop we use to build DRS. Prompt and code evolve together; intent and
implementation never drift.

Reference: <https://martinfowler.com/articles/structured-prompt-driven/>

---

## The six-step loop

```
        ┌─────────────────────────────────────────────────────────────┐
        │                                                             │
   (1) STORY ──▶ (2) CLARIFY ──▶ (3) ANALYSIS ──▶ (4) CANVAS ──▶ (5) GENERATE ──▶ (6) TEST
        │            (human)         │               │              │              │
   spdd-story                   spdd-analysis   spdd-reasons-    spdd-generate   (from canvas
                                                  canvas                          Operations)
```

| #   | Step                       | Command (prompt)                                                        | Output                               | Who        |
| --- | -------------------------- | ----------------------------------------------------------------------- | ------------------------------------ | ---------- |
| 1   | Create/refine requirements | [`spdd-story`](./commands/spdd-story.md)                                | `stories/<ID>-*.story.md`            | AI + human |
| 2   | Clarify & align            | — (review)                                                              | edits to the story; scope locked     | **human**  |
| 3   | Generate analysis context  | [`spdd-analysis`](./commands/spdd-analysis.md)                          | `analysis/<ID>-<date>-analysis-*.md` | AI         |
| 4   | Generate REASONS Canvas    | [`spdd-reasons-canvas`](./commands/spdd-reasons-canvas.md)              | `canvas/<ID>-<date>-canvas-*.md`     | AI + human |
| 5   | Generate code              | [`spdd-generate`](./commands/spdd-generate.md)                          | source code, task-by-task            | AI         |
| 6   | Generate unit tests        | from Canvas Operations / [`spdd-api-test`](./commands/spdd-api-test.md) | tests                                | AI         |

**Running a step.** Each command in the table is a Claude Code slash command —
`/spdd-story`, `/spdd-analysis`, `/spdd-reasons-canvas`, `/spdd-generate`,
`/spdd-prompt-update`, `/spdd-sync`, `/spdd-api-test` — registered in
`.claude/commands/`. Each is a thin wrapper around its spec in
[`commands/`](./commands/); pass the slice id or input as the argument
(e.g. `/spdd-analysis DRS-0001`). The linked `commands/*.md` files remain the
authoritative spec.

**Human gates** sit at steps 2 and 4: lock business intent before analysis, and
review the Canvas before any code is generated. Tests come **last** — by then intent
is explicit (Canvas) and the implementation has been stabilised, so tests act as a
regression net rather than a design tool.

---

## The synchronization rule

> **When reality diverges, fix the prompt first — then update the code.**

Two directions, chosen by the _type_ of change:

### Logic correction — behaviour is wrong → **prompt first**

Requirements or business rules change, or the generated behaviour is incorrect.

1. Update the Canvas (and story if scope shifts) with
   [`spdd-prompt-update`](./commands/spdd-prompt-update.md).
2. Regenerate the affected code from the updated Canvas.

```
requirement change ──▶ Canvas (prompt-update) ──▶ Code (re-generate)
```

### Refactor — structure improves, behaviour unchanged → **code first**

Renames, extraction, perf tuning, dependency swaps.

1. Change the code directly.
2. Sync the Canvas back with [`spdd-sync`](./commands/spdd-sync.md) so the spec
   still describes reality.

```
code refactor ──▶ Canvas (sync, Structure/Operations updated)
```

If you can't tell which it is: does the _observable behaviour or contract_ change?
Yes → logic correction (prompt first). No → refactor (code first, then sync).

---

## Three skills SPDD asks of you

1. **Abstraction first** — design entities and boundaries (R/E/A/S) before any code.
2. **Alignment** — lock intent and constraints (the human gates) before implementation.
3. **Iterative review** — treat AI output as a governed loop, not one-shot generation.
   See <https://martinfowler.com/articles/structured-prompt-driven/iterative-review.html>.

---

## Definition of Done for a slice

A slice (one story) is done when:

- [ ] Story reviewed and scope locked (step 2).
- [ ] Canvas reviewed; Norms/Safeguards referenced, deltas captured (step 4).
- [ ] Code generated and matches the Canvas Operations.
- [ ] Tests pass and cover the Operations' acceptance points.
- [ ] Canvas and code are in sync (no known drift).
- [ ] Deployed (or deployable) to Vercel preview.
