// All 26 Swiss cantons — used by the Circuits atlas to tell the coverage story
// (which cantons have a public kart track, which are still blank).

import type { Track } from './types';

export interface Canton {
  code: string;
  name: string;
}

// Ordered roughly west → east, north → south.
export const SWISS_CANTONS: Canton[] = [
  { code: 'GE', name: 'Genève' },
  { code: 'VD', name: 'Vaud' },
  { code: 'VS', name: 'Valais' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'JU', name: 'Jura' },
  { code: 'BE', name: 'Bern' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'BL', name: 'Basel-Land' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'AG', name: 'Aargau' },
  { code: 'LU', name: 'Luzern' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'UR', name: 'Uri' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'ZG', name: 'Zug' },
  { code: 'ZH', name: 'Zürich' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'AR', name: 'Appenzell A.Rh.' },
  { code: 'AI', name: 'Appenzell I.Rh.' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'GL', name: 'Glarus' },
  { code: 'GR', name: 'Graubünden' },
  { code: 'TI', name: 'Ticino' },
];

export interface CantonCoverage {
  covered: { code: string; name: string; count: number }[];
  empty: Canton[];
}

/** Split the 26 cantons into those with a public track and those still blank. */
export function cantonCoverage(tracks: Track[]): CantonCoverage {
  const counts = new Map<string, number>();
  for (const t of tracks) counts.set(t.cantonCode, (counts.get(t.cantonCode) ?? 0) + 1);
  const covered: CantonCoverage['covered'] = [];
  const empty: Canton[] = [];
  for (const c of SWISS_CANTONS) {
    const n = counts.get(c.code) ?? 0;
    if (n > 0) covered.push({ ...c, count: n });
    else empty.push(c);
  }
  return { covered, empty };
}
