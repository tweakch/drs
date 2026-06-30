# spdd-sync

**Sync direction: code-first.** Use after a **refactor** — structure improved,
observable behaviour unchanged — to bring the Canvas back in line with the code.

> SPDD keeps prompt and code synchronized. Refactors change code first; the spec is
> then synced so it still describes reality.

## When to run

- Renames, file moves, extraction, dependency swaps, performance tuning.
- Any change where the **contract/behaviour is the same** but the code shape differs.

Decision test: behaviour/contract unchanged → this. Behaviour changes → use
[`spdd-prompt-update`](./spdd-prompt-update.md) instead.

## Inputs

- The current code (the diff/refactor just made).
- The slice's Canvas.

## Instructions to the agent

1. Read the refactor. Identify what the Canvas now describes inaccurately — typically
   **S — Structure** (file paths, components, dependencies) and sometimes
   **O — Operations** wording.
2. Update those sections to match the code. Do **not** change R/E/A intent unless the
   refactor revealed the spec was wrong (if so, that's a logic change — switch to
   `spdd-prompt-update`).
3. Update [`../shared/entities.md`](../shared/entities.md) / `norms` if shared
   structure moved.
4. Bump `updated`, append a **Changelog** entry, set `status: synced`.
5. Confirm tests still pass — behaviour must be unchanged.

## Output

A Canvas that once again accurately describes the implemented code, with no behaviour
drift.
