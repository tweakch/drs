# Conventions

Naming and organisation rules for SPDD artifacts in this repo.

## Ticket / story IDs

- Prefix: **`DRS`** (the project). Format: `DRS-NNNN`, zero-padded to 4 digits.
- `DRS-0001` is the foundation/scaffold. Increment per slice.
- One story = one independently shippable slice (INVEST).

## File naming

Based on the SPDD article's pattern `[STORY-ID]-[TIMESTAMP]-[Type]-[description]`.
We use a **`YYYYMMDD`** date stamp (not a full timestamp) for readable, sortable,
git-friendly filenames. If two artifacts of the same type share a date, append `-bN`.

| Artifact | Pattern                                             | Example                                             |
| -------- | --------------------------------------------------- | --------------------------------------------------- |
| Story    | `stories/<ID>-<slug>.story.md`                      | `DRS-0002-data-ingest.story.md`                     |
| Analysis | `analysis/<ID>-<YYYYMMDD>-analysis-<slug>.md`       | `DRS-0002-20260705-analysis-data-ingest.md`         |
| Canvas   | `canvas/<ID>-<YYYYMMDD>-canvas-<slug>.md`           | `DRS-0002-20260705-canvas-data-ingest.md`           |
| Test     | `tests/<ID>-<YYYYMMDD>-test-<slug>.md`              | `DRS-0002-20260705-test-data-ingest.md`             |

- `<slug>` is kebab-case, matches across the four artifacts of one slice.
- Templates are prefixed `_TEMPLATE.` and ignored by tooling.

## Cross-references

- Link related artifacts with relative Markdown links.
- A Canvas **must** link its source story and analysis in its header.
- A Canvas's **E**ntities and **N**orms/**S**afeguards sections reference
  [`shared/`](./shared/) rather than copying — add only per-slice deltas.

## Front-matter

Every artifact starts with a YAML front-matter block:

```yaml
---
id: DRS-0001
slice: repo-foundation
type: canvas            # story | analysis | canvas | test
status: draft           # draft | in-review | approved | implemented | synced
created: 2026-06-30
updated: 2026-06-30
source_story: stories/DRS-0001-repo-foundation.story.md
source_analysis: analysis/DRS-0001-20260630-analysis-repo-foundation.md  # canvas only
source_canvas: canvas/DRS-0001-20260630-canvas-repo-foundation.md        # test only
---
```

Only the relevant `source_*` links apply per type: a story has none, an analysis links
its `source_story`, a canvas links `source_story` + `source_analysis`, a test links its
`source_canvas`.

`status` lifecycle: `draft → in-review → approved → implemented → synced`.

## Keeping in sync

- After a **logic** change: bump the Canvas `updated`, add a changelog entry at the
  bottom, regenerate code. (`spdd-prompt-update`)
- After a **refactor**: change code, then `spdd-sync` updates the Canvas's Structure
  / Operations and sets `status: synced`.
- Never let code and an `approved`/`implemented` Canvas describe different behaviour.

## Git

- Commit prompts **with** the code they generate, in the same change, so review sees
  intent + implementation together.
- Prompt-only commits are fine for steps 1–4 (before code exists).
