---
id: SHARED
slice: cross-cutting
type: safeguards
status: approved
created: 2026-06-30
updated: 2026-06-30
---

# S — Safeguards (non-negotiable boundaries)

Invariants, limits, and rules that must hold in **every** slice. A Canvas references
this file and may tighten — never loosen — these. If a slice needs to break one, that
is a design decision requiring explicit human sign-off recorded in the Canvas.

## Analytics correctness (the crown jewels)

These derivations are the product. They must produce **identical numbers** to the
prototype for the same input (guarded by the golden-master snapshot — see
[`norms.md`](./norms.md) testing):

- Outlier rule: IQR fence `[Q1 − 1.5·IQR, Q3 + 1.5·IQR]`, min 4 laps.
- Grid-lap exclusion: first lap < 0.5 × racing median.
- Pit/stint split threshold: 1.35 × racing median, current stint ≥3 laps.
- Effects decomposition: kart effects centred to mean 0; driver pace = average-kart
  expectation. Report R² and crossover validity honestly; **never** present a
  decomposition as reliable when crossover is insufficient or R² is low.
- Statistics use sample standard deviation (n−1), as in the prototype.
- The engine is **pure and deterministic**: same input → same output, no clock/random.

## Data integrity

- The **canonical race is immutable** once ingested. Virtual / what-if results are
  derived and must never overwrite the official race in storage.
- Every persisted race retains its **raw source dump** (Blob) so it can be re-parsed.
- Schema migrations are forward-only and reviewed; no destructive migration without
  a backup step.

## Security

- All external input validated at the boundary (Zod) — pasted timing, API bodies,
  query params. Never trust client-supplied totals/derived values; recompute server-side.
- No secrets in the repo or client bundle. DB/Blob credentials only via Vercel env
  vars, accessed server-side. `NEXT_PUBLIC_*` is for non-secret config only.
- Parameterised queries only (no string-built SQL). No raw SQL from user input.
- Rate-limit write/ingest endpoints. Cap upload size (see limits).

## Limits (performance & abuse)

- Max raw timing upload: **5 MB** per race (Blob). Reject larger with a clear error.
- Max teams per race: **64**; max laps per team: **2000** (a 2h race is ~130 laps).
- Parsing and full analysis of a typical race (≤17 teams) must complete in **<200 ms**
  server-side; never block the request thread on the client for >1 frame — offload
  heavy recompute appropriately.
- Replay animation targets 60 fps; degrade gracefully on weak devices.

## Privacy

- Driver names are user-supplied and may be real people: treat as low-sensitivity PII.
  No third-party analytics on name data; no names in logs.
- Locale `de-CH`; respect Swiss/EU expectations (no surprise data sharing).

## Platform

- Must deploy cleanly to **Vercel** with zero manual steps beyond env vars.
- Stay within Vercel serverless function limits (memory/time); long jobs must be
  chunked or moved off the request path.
- No Node-only APIs in Edge runtime code paths unless the runtime is pinned to Node.
