// DRS-0009 seed stage (applies committed SQL to the DB). Offline — no API calls.
// Run: `pnpm seed` with DATABASE_URL(_UNPOOLED) set. Each .sql file is idempotent
// (natural-key upserts), so this is safe to run against prod repeatedly.
//
// Mirrors lib/db/migrate.ts: executed by `node --experimental-strip-types`, reads
// the connection string straight from process.env (no @/ alias, no Blob token).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      '[DRS] seed: set DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL before running `pnpm seed`.',
    );
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const sqlDir = join(here, 'seeds', 'f1', 'sql');
  if (!existsSync(sqlDir)) {
    throw new Error(`[DRS] seed: no SQL directory at ${sqlDir} — run \`pnpm seed:build\` first.`);
  }
  const files = readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  if (files.length === 0) {
    throw new Error('[DRS] seed: no .sql files found — run `pnpm seed:build` first.');
  }

  const pool = new Pool({ connectionString });
  try {
    for (const file of files) {
      const sql = readFileSync(join(sqlDir, file), 'utf8');
      // One simple-query batch on a single connection → atomic per file. An error
      // anywhere aborts and rolls the whole file back; idempotency makes retries safe.
      await pool.query(`begin;\n${sql}\ncommit;`);
      console.log(`[DRS] applied ${file}`);
    }

    // Round-trip verification through the seeded tables.
    const races = await pool.query(
      `select count(*)::int as n from races where source_ref is not null`,
    );
    const cars = await pool.query(
      `select count(*)::int as n from teams where source_ref is not null`,
    );
    const laps = await pool.query(
      `select count(*)::int as n from laps l
         join teams t on t.id = l.team_id
        where t.source_ref is not null`,
    );
    const n = (r: { rows: Record<string, unknown>[] }): number => Number(r.rows[0]?.n ?? 0);
    console.log(`[DRS] seeded: ${n(races)} F1 race(s), ${n(cars)} cars, ${n(laps)} laps`);
  } finally {
    await pool.end();
  }
}

seed().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
