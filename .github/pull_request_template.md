<!--
  Keep PRs scoped to one SPDD slice where possible. Title must follow
  Conventional Commits, e.g. "feat(race): add gap-to-leader column".
-->

## What & why

<!-- One or two sentences. Link the slice/canvas this implements. -->

Slice: <!-- e.g. DRS-0001 -->
Canvas: <!-- e.g. prompts/canvas/DRS-0001-20260630-canvas-repo-foundation.md -->

## SPDD sync check

- [ ] The relevant Canvas reflects this change (logic change → `spdd-prompt-update`
      first; refactor → code first, then `spdd-sync`).
- [ ] Canvas `status` / changelog updated if behaviour or structure changed.
- [ ] Shared context (`prompts/shared/*`) updated if entities/norms/safeguards moved.

## Quality

- [ ] `pnpm format:check`, `lint`, `typecheck`, `test` pass locally.
- [ ] No secrets committed; `.env*` untracked.
- [ ] Commits follow Conventional Commits.

## Notes for the reviewer

<!-- Anything non-obvious: trade-offs, follow-ups, screenshots of preview deploy. -->
