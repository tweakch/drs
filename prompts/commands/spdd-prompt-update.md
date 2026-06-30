# spdd-prompt-update

**Sync direction: prompt-first.** Use for a **logic correction** — requirements or
business rules changed, or generated behaviour is wrong.

> SPDD rule: *when reality diverges, fix the prompt first — then update the code.*

## When to run
- A requirement/business rule changed.
- The behaviour is incorrect (the spec, not just the code, was wrong).
- New scope is added to an existing slice.

Decision test: does the **observable behaviour or contract** change? If yes → this.
If it's a pure refactor (behaviour unchanged) → use [`spdd-sync`](./spdd-sync.md).

## Inputs
- The Canvas (and story, if scope shifts) for the slice.
- The description of what must change.

## Instructions to the agent
1. Update the **story** if the requirement itself changed (acceptance criteria, scope).
2. Update the **Canvas** incrementally — only the affected parts (usually R, A, O, and
   maybe E/S). Preserve unaffected sections.
3. If an entity changes, update [`../shared/entities.md`](../shared/entities.md) too.
4. Bump `updated`, append a **Changelog** entry describing the change and why.
5. Set `status: approved` only after human review; then **regenerate** the affected
   code with [`spdd-generate`](./spdd-generate.md) and update tests.

## Output
An updated Canvas (and story) that is the new source of truth, followed by regenerated
code so prompt and code match again.
