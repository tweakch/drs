# spdd-generate

**Step 5 of the SPDD loop.** Generate code from an approved REASONS Canvas.

## When to run
Only after the Canvas is reviewed and `status: approved`.

## Inputs
- The approved Canvas `../canvas/DRS-NNNN-YYYYMMDD-canvas-<slug>.md`.
- Shared norms & safeguards (the Canvas references them; obey both).

## Instructions to the agent
1. Read the Canvas top-to-bottom. Treat **Operations** as the ordered build contract.
2. Implement **task-by-task**, in order. For each Operation:
   - Write the code described in **Structure** at the specified paths.
   - Follow **Norms** (TS strict, structure, naming, Tailwind, pure `lib/analytics`).
   - Respect every **Safeguard** (analytics correctness, immutable canonical race,
     input validation, limits). These are non-negotiable.
   - Verify the Operation's **acceptance** line before moving on.
3. Do **not** invent scope beyond the Canvas. If a needed detail is missing or the
   Canvas is wrong, **stop and fix the prompt first** (`spdd-prompt-update`) — do not
   silently diverge. This is the core SPDD rule.
4. Keep the analytics engine pure and deterministic; recompute server-side, never
   trust client-supplied derived values.
5. After generating, set the Canvas `status: implemented` and commit the prompt with
   the code.

## Output
Working code matching the Canvas, plus a short summary mapping each Operation to the
files that fulfil it. Unit tests follow (step 6, derived from Canvas Operations).
