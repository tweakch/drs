// Trace a circuit from OpenStreetMap into a registry-ready SVG silhouette.
//
//   pnpm trace <wayId>[,<wayId>...]
//   e.g. pnpm trace 1126111119          (Pista GOKART Magadino)
//        pnpm trace 163872055,163872052 (Kartbahn Lyss: loop + connector)
//
// Fetches the raceway way geometry from Overpass, projects it (lib/track/project),
// and prints the `layout` + `layoutViewBox` to paste into lib/entities/registry.ts.
// Dev-time tool — like the F1 seed fetch, it hits the network and is run by hand.

import { projectTrack, type LatLon } from './project.ts';

const OVERPASS = 'https://overpass-api.de/api/interpreter';

interface OsmWay {
  id: number;
  geometry: LatLon[];
}

async function fetchWays(ids: number[]): Promise<OsmWay[]> {
  const query = `[out:json][timeout:30];way(id:${ids.join(',')});out geom;`;
  // GET (not POST): some networks mangle the POST body; Overpass accepts ?data=.
  const url = `${OVERPASS}?${new URLSearchParams({ data: query })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'DRS-kart-atlas/1.0 (track tracer)' } });
  if (!res.ok) throw new Error(`Overpass returned ${res.status} ${res.statusText}`);
  const data = (await res.json()) as {
    elements: { type: string; id: number; geometry?: LatLon[] }[];
  };
  return data.elements
    .filter((e) => e.type === 'way' && !!e.geometry?.length)
    .map((e) => ({ id: e.id, geometry: e.geometry as LatLon[] }));
}

async function main() {
  const ids = process.argv
    .slice(2)
    .flatMap((a) => a.split(','))
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!ids.length) {
    console.error('usage: pnpm trace <wayId>[,<wayId>...]');
    process.exit(1);
  }

  console.error(`Fetching ${ids.length} way(s) from OpenStreetMap…`);
  const fetched = await fetchWays(ids);
  // Preserve the argument order (so the first way leads the path).
  const ways = ids.map((id) => fetched.find((w) => w.id === id)).filter((w): w is OsmWay => !!w);

  const missing = ids.filter((id) => !ways.some((w) => w.id === id));
  if (missing.length) console.error(`⚠ no geometry for way(s): ${missing.join(', ')}`);
  if (!ways.length) throw new Error('no usable way geometry returned');

  const { path, viewBox } = projectTrack(ways.map((w) => w.geometry));

  console.error(`✓ ${ways.map((w) => `${w.id} (${w.geometry.length} pts)`).join(', ')}`);
  console.error('© OpenStreetMap contributors (ODbL)\n');
  console.log('// paste into the track entry in lib/entities/registry.ts:');
  console.log(`shape: 'traced',`);
  console.log(`layout: '${path}',`);
  console.log(`layoutViewBox: '${viewBox}',`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
