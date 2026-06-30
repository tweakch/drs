# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately via GitHub's **Private Vulnerability Reporting**:
<https://github.com/tweakch/drs/security/advisories/new>

If you can't use that channel, contact the maintainers (`@tweakch`) and we'll arrange a
private disclosure path.

Please include:

- a description of the issue and its impact,
- steps to reproduce (proof-of-concept if possible),
- affected area (view / module / endpoint) and environment.

We aim to acknowledge a report within a few business days and will keep you updated on
remediation and disclosure timing.

## Scope

This repository currently contains the repository/delivery foundation and SPDD prompts;
the application (Next.js, Vercel Postgres/Blob) lands in DRS-0002. Once the app exists,
security-relevant expectations are documented in
[`prompts/shared/safeguards.md`](./prompts/shared/safeguards.md) — notably: validate all
external input at the boundary, keep secrets in environment variables only (never in the
repo or client bundle), use parameterised queries, and recompute derived values
server-side.

## Supported versions

DRS is developed trunk-based; only the latest `main` (and its current production deploy)
is supported. Fixes land on `main` and roll out via Vercel.
