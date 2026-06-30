# ADR-0003: Persistence — Vercel Postgres + Vercel Blob

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** tweakch

## Context

DRS needs to persist races so they can be saved, revisited, and shared, and to store the
raw timing dumps each race was parsed from. The relational shape (race → team → lap) is
clear; raw dumps are large, opaque payloads better suited to object storage. We want
storage that integrates seamlessly with Vercel.

## Decision

Use **Vercel Postgres** for the relational core (`races`, `teams`, `laps`; stints are
derived, not stored) accessed through a thin typed query layer (`@vercel/postgres`, typed
SQL — no ORM yet). Use **Vercel Blob** for raw timing dumps and exports. The canonical
race is immutable once ingested; virtual/what-if results are derived and never overwrite
it. (Schema + clients land in DRS-0002; the env-var contract is defined in DRS-0001.)

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
- **Client-only (localStorage + URL)** — no sharing/multi-user; rejected for a product.
