// Applies lib/db/schema.sql against the database. Run with `pnpm migrate` when
// the DB env vars are set. Uses the unpooled connection (DDL over a direct link).
//
// This script is executed directly by Node (`node --experimental-strip-types`), which
// does NOT resolve the tsconfig `@/*` alias and does NOT load lib/env's full contract
// (migrations don't need the Blob token). So it reads the connection string straight
// from process.env here.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

async function migrate(): Promise<void> {
  const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      '[DRS] migrate: set DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL before running `pnpm migrate`.',
    );
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const ddl = readFileSync(join(here, 'schema.sql'), 'utf8');

  const pool = new Pool({ connectionString });
  try {
    await pool.query(ddl);
    console.log('[DRS] schema applied');
  } finally {
    await pool.end();
  }
}

migrate().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
