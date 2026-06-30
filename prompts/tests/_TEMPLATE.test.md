---
id: DRS-NNNN
slice: <slug>
type: test
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_canvas: ../canvas/DRS-NNNN-YYYYMMDD-canvas-<slug>.md
---

# Test intent — DRS-NNNN · <Title>

> Tests come last in SPDD — a regression net derived from the Canvas Operations, not
> a design tool. Each acceptance point in the Canvas should map to at least one test.

## Coverage map (Operations → tests)

| Canvas Operation | Test(s)     |
| ---------------- | ----------- |
| 1. <step>        | <test name> |

## Unit tests

- **<unit under test>**
  - <case: input → expected output>

## Golden-master / fixtures

- <e.g. official 28.06.2026 Wohlen race: parsed result + derived stats snapshot>

## Edge cases

- <empty input, malformed laps, single team, insufficient crossover, etc.>

## Non-goals for tests this slice

- <what we deliberately don't test yet>
