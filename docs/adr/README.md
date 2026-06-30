# Architecture Decision Records

ADRs capture _why_ we made a significant, hard-to-reverse decision. They complement the
SPDD canvases in [`prompts/`](../../prompts/), which capture _what_ and _how_ for each
slice.

- Format: lightweight [MADR](https://adr.github.io/madr/)-style — see
  [`0000-template.md`](./0000-template.md).
- One decision per file; numbered sequentially; never delete — supersede instead
  (mark the old one `Superseded by ADR-XXXX`).
- Add an ADR when a decision affects architecture, tooling, process, or has notable
  trade-offs. Link it from the PR.

## Index

| ADR                                                | Title                                      | Status   |
| -------------------------------------------------- | ------------------------------------------ | -------- |
| [0001](./0001-adopt-spdd.md)                       | Adopt Structured-Prompt-Driven Dev         | Accepted |
| [0002](./0002-tech-stack-nextjs-vercel.md)         | Tech stack: Next.js + TypeScript on Vercel | Accepted |
| [0003](./0003-persistence-vercel-postgres-blob.md) | Persistence: Neon Postgres + Vercel Blob   | Accepted |
| [0004](./0004-trunk-based-with-vercel-previews.md) | Trunk-based dev with Vercel previews       | Accepted |
| [0005](./0005-node-pnpm-policy.md)                 | Node & pnpm version policy                 | Accepted |
