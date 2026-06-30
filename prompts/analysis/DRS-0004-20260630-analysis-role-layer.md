---
id: DRS-0004
slice: role-layer
type: analysis
status: approved
created: 2026-06-30
updated: 2026-06-30
source_story: ../stories/DRS-0004-admin-role.story.md
covers: [DRS-0004, DRS-0005, DRS-0006, DRS-0007]
---

# Analysis — Role layer (DRS-0004…0007)

> One analysis for the four role slices (they all compose on the DRS-0003 foundation).
> Behaviours resolved by the forum → [ADR-0006](../../docs/adr/0006-auth-and-rbac.md).
> Kept deliberately **simple**: each role gets a server-side-guarded, scope-aware surface
> plus its one primary "next-tier" action; analytics-dependent content stays a placeholder
> until the data/engine slices land (per each story's sequencing note).

## Shared mechanics (from DRS-0003)

- `requireRole` / `requireScope` / `can` from `lib/auth/` gate every page + server action.
- Scope comes from the URL/membership, never the client.
- The next-tier invite reuses `lib/auth/invitations.ts`; issuer must out-rank the grant.
- All DB access via `lib/db/queries.ts`, **scoped** to the caller.

## Per role (minimal, shippable now)

- **DRS-0004 Admin** — `/admin`, platform-admin only: list users + memberships, list all
  events with owner, pending invitations; **invite a Director**. (Reassign-owner + rich
  audit: simple if cheap, else later.)
- **DRS-0005 Director** — `/director`, Director scope: list own events, **create event**,
  per-event **invite a Team**, set status (`draft→live→published`). Field setup beyond a
  team entry is deferred to the data slice.
- **DRS-0006 Team** — `/team`, Team scope: show own team + roster, **invite a Driver**.
  Stint tagging + analysis deferred (engine stubbed).
- **DRS-0007 Driver** — `/driver`, Driver scope: own profile, **edit display name**.
  Personal metrics deferred (engine stubbed).

## Risks

- Keep server actions env-gated (lazy DB) so build stays green with no DB.
- Don't leak cross-tenant data: every query filtered by resolved scope; 404 otherwise.
- These pages currently replace the DRS-0002 placeholders for the four role tabs; the
  other five analysis views remain placeholders.

## Operations outline (per slice, mirrored in each canvas)

guard page (requireRole+scope) → scoped read query → primary server action (invite /
create / edit) → minimal UI → verify gates green with no DB.
