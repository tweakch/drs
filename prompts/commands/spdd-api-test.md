# spdd-api-test

**Optional.** Generate API-level validation scripts (cURL / HTTP) for a slice that
adds Route Handlers or Server Actions — used to validate the running implementation
before the unit-test regression net is written.

## When to run

After `spdd-generate` for any slice that exposes an HTTP surface (e.g. race
ingest/save, share-link, exports). Skip for pure UI/client slices.

## Inputs

- The slice's Canvas (Structure + Operations name the endpoints and contracts).
- The running app (local `pnpm dev` or a Vercel preview URL).

## Instructions to the agent

1. From the Canvas, enumerate each endpoint: method, path, request body/params,
   expected status and response shape, and the relevant safeguards (validation,
   limits, auth).
2. Produce a runnable script (a `.http` file or `curl` commands) covering:
   - happy path,
   - validation failures (bad/oversized input → 4xx with clear error),
   - boundary limits from [`../shared/safeguards.md`](../shared/safeguards.md)
     (e.g. >5 MB upload, >64 teams).
3. Note expected results inline so the script doubles as documentation.
4. Save under the slice's tests area or `tests/http/`.

## Output

An executable API test script that validates the endpoint contracts against a live
instance. Findings that reveal a spec problem → fix the prompt first
(`spdd-prompt-update`).
