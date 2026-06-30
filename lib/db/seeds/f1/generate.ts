// DRS-0009 generate stage (pure, offline). Reads committed fixtures and writes
// idempotent SQL seed files. Run: `pnpm seed:build [fixture.json]` (defaults to
// every fixture under ./fixtures). No network, no DB — just the pure transform.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureToSql } from './transform.ts';
import type { RaceFixture } from './types.ts';

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const fixturesDir = join(here, 'fixtures');
  const sqlDir = join(here, 'sql');
  mkdirSync(sqlDir, { recursive: true });

  const arg = process.argv[2];
  const files = arg ? [arg] : readdirSync(fixturesDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('[DRS] no fixtures found — run `pnpm seed:fetch` first.');
    process.exit(1);
  }

  for (const file of files) {
    const fixture = JSON.parse(readFileSync(join(fixturesDir, file), 'utf8')) as RaceFixture;
    const out = join(sqlDir, `seed-${file.replace(/\.json$/, '')}.sql`);
    writeFileSync(out, fixtureToSql(fixture), 'utf8');
    console.log(`[DRS] wrote ${out} (${fixture.sourceRef}, ${fixture.entries.length} cars)`);
  }
}

main();
