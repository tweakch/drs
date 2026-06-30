// Project OSM track geometry (lat/lon) into a normalised SVG path + viewBox — the
// recipe TRACKS.md documents for tracing a circuit (Wohlen, Lyss). Pure & testable.

export interface LatLon {
  lat: number;
  lon: number;
}

export interface TraceResult {
  /** SVG path `d` (one subpath per way). */
  path: string;
  /** viewBox framing the path. */
  viewBox: string;
}

export interface ProjectOptions {
  /** Longest side of the drawing, before padding. */
  target?: number;
  /** Padding around the drawing, in the same units. */
  pad?: number;
}

/**
 * Project one or more OSM ways into a single SVG path.
 *
 * lat/lon are projected to a local planar frame (cos-latitude corrected so the
 * aspect isn't stretched), y is flipped (north up), then the whole drawing is
 * scaled to fit `target` and padded — so any traced circuit shares one convention.
 */
export function projectTrack(ways: LatLon[][], opts: ProjectOptions = {}): TraceResult {
  const target = opts.target ?? 360;
  const pad = opts.pad ?? 24;
  const all = ways.flat();
  if (!all.length) throw new Error('projectTrack: no geometry');

  const meanLat = (all.reduce((s, p) => s + p.lat, 0) / all.length) * (Math.PI / 180);
  const cos = Math.cos(meanLat);
  const project = (p: LatLon) => ({ x: p.lon * cos, y: -p.lat });
  const projected = ways.map((w) => w.map(project));
  const flat = projected.flat();

  const xs = flat.map((p) => p.x);
  const ys = flat.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const s = target / span;

  const tx = (x: number) => Number((pad + (x - minX) * s).toFixed(1));
  const ty = (y: number) => Number((pad + (y - minY) * s).toFixed(1));

  const path = projected
    .map((w) => 'M ' + w.map((p, i) => (i ? 'L ' : '') + tx(p.x) + ' ' + ty(p.y)).join(' '))
    .join(' ');

  const vbW = Number(((maxX - minX) * s + 2 * pad).toFixed(1));
  const vbH = Number(((maxY - minY) * s + 2 * pad).toFixed(1));
  return { path, viewBox: `0 0 ${vbW} ${vbH}` };
}
