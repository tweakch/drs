// Applies lib/db/schema.sql against the database. Run with `pnpm migrate` when
// DB env vars are set. Uses the unpooled connection (DDL over a direct link).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';
import { getEnv } from '@/lib/env';

async function migrate(): Promise<void> {
  const env = getEnv();
  const connectionString = env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL;
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
