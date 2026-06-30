// DRS-0009 fetch stage (dev-time, network). Pulls one F1 race from Jolpica/Ergast,
// validates every response with Zod, normalizes it via the pure transform, and
// writes a committed JSON fixture. Run: `pnpm seed:fetch [season/round]`
// (defaults to the latest completed race). Throttled to respect Jolpica limits.
//
// Executed by `node --experimental-strip-types` (no @/ alias); imports are relative
// with explicit .ts extensions, like lib/db/migrate.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LapsResponse, ResultsResponse } from './jolpica.ts';
import { buildFixture } from './transform.ts';

const BASE = 'https://api.jolpi.ca/ergast/f1';
const PAGE = 100;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`[DRS] fetch ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const target = arg && arg.includes('/') ? arg : 'current/last';

  console.log(`[DRS] fetching results for ${target} …`);
  const results = ResultsResponse.parse(await getJson(`${BASE}/${target}/results.json`));
  const race = results.MRData.RaceTable.Races[0];
  if (!race) throw new Error('[DRS] no race in results response');
  const { season, round } = race;
  console.log(`[DRS] ${race.raceName} ${season} (round ${round}) — ${race.Results.length} cars`);

  // Lap timings are paginated by timing-row; merge Timings per lap number.
  const byLap = new Map<number, { driverId: string; time: string }[]>();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const page = LapsResponse.parse(
      await getJson(`${BASE}/${season}/${round}/laps.json?limit=${PAGE}&offset=${offset}`),
    );
    total = Number(page.MRData.total);
    const lapsRace = page.MRData.RaceTable.Races[0];
    for (const lap of lapsRace?.Laps ?? []) {
      const n = Number(lap.number);
      const arr = byLap.get(n) ?? [];
      arr.push(...lap.Timings);
      byLap.set(n, arr);
    }
    offset += PAGE;
    if (offset < total) await sleep(300);
  }
  const laps = [...byLap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([number, Timings]) => ({ number: String(number), Timings }));
  console.log(`[DRS] fetched ${laps.length} laps (${total} timings)`);

  const fixture = buildFixture({ race, laps, fetchedAt: new Date().toISOString() });

  const here = dirname(fileURLToPath(import.meta.url));
  const dir = join(here, 'fixtures');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `f1-${season}-${round}.json`);
  writeFileSync(file, JSON.stringify(fixture, null, 2) + '\n', 'utf8');

  const lapRows = fixture.entries.reduce((s, e) => s + e.laps.length, 0);
  console.log(`[DRS] wrote ${file} — ${fixture.entries.length} cars, ${lapRows} lap rows`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
