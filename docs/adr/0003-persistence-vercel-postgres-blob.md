# ADR-0003: Persistence — Neon Postgres + Vercel Blob

- **Status:** Accepted
- **Date:** 2026-06-30
- **Revised:** 2026-06-30 — provider/driver changed from `@vercel/postgres` to **Neon**
  after review found `@vercel/postgres` is deprecated (pre-merge correction; see below).
- **Deciders:** tweakch

## Context

DRS needs to persist races so they can be saved, revisited, and shared, and to store the
raw timing dumps each race was parsed from. The relational shape (race → team → lap) is
clear; raw dumps are large, opaque payloads better suited to object storage. We want
storage that integrates seamlessly with Vercel.

## Decision

Use **Neon Postgres** (provisioned via the **Vercel Marketplace** native integration) for
the relational core (`races`, `teams`, `laps`; stints are derived, not stored), accessed
through a thin typed query layer (`@neondatabase/serverless`, typed SQL — no ORM yet). Use
**Vercel Blob** (`@vercel/blob`) for raw timing dumps and exports. The Neon integration
sets `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct, for migrations). The
canonical race is immutable once ingested; virtual/what-if results are derived and never
overwrite it. (Schema + clients land in DRS-0002; the env-var contract is defined in
DRS-0001.)

> Note: `@vercel/postgres` (and `@vercel/kv`) were deprecated by Vercel — storage moved to
> Marketplace native integrations, with Neon the recommended Postgres path.
> `@vercel/blob` is **not** affected and remains the Blob client.

## Consequences

**Positive**

- Native Vercel integration; env vars auto-populated when stores are connected.
- Clear separation: structured data in Postgres, large blobs in Blob.
- Keeping the raw dump allows re-parsing as the engine evolves.

**Negative / trade-offs**

- Typed SQL means more hand-written queries than an ORM; revisit if query complexity grows.
- Serverless Postgres connection limits require pooled connections / care in functions.

## Alternatives considered

- **Vercel KV / Edge Config only** — simpler, but no relational querying for analysis.
- **An ORM (e.g. Drizzle) up front** — premature; start with typed SQL, reconsider in
  the data slice.
- **`@vercel/postgres` (original choice)** — deprecated by Vercel before any code shipped;
  superseded by the Neon native integration in this revision.
- **Client-only (localStorage + URL)** — no sharing/multi-user; rejected for a product.
