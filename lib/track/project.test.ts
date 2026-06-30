import { describe, expect, it } from 'vitest';
import { projectTrack } from './project';

describe('projectTrack', () => {
  const square = [
    [
      { lat: 47.0, lon: 7.0 },
      { lat: 47.0, lon: 7.001 },
      { lat: 47.001, lon: 7.001 },
      { lat: 47.001, lon: 7.0 },
    ],
  ];

  it('emits one M subpath per way with L segments', () => {
    const { path } = projectTrack(square);
    expect(path.startsWith('M ')).toBe(true);
    expect((path.match(/L /g) ?? []).length).toBe(3); // 4 points → 3 line segments
    expect(path.match(/M /g)).toHaveLength(1);
  });

  it('fits inside the padded viewBox', () => {
    const { path, viewBox } = projectTrack(square, { target: 100, pad: 10 });
    expect(viewBox).toMatch(/^0 0 [\d.]+ [\d.]+$/);
    const coords = [...path.matchAll(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g)].flatMap((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    expect(Math.min(...coords)).toBeGreaterThanOrEqual(10); // ≥ pad
  });

  it('keeps multiple ways as separate subpaths', () => {
    const two = [square[0], square[0].map((p) => ({ lat: p.lat + 0.002, lon: p.lon }))];
    expect(projectTrack(two).path.match(/M /g)).toHaveLength(2);
  });

  it('does not stretch aspect (cos-lat corrected): a N–S span reads taller than E–W', () => {
    // 0.001° of latitude is longer on the ground than 0.001° of longitude at 47°N.
    const ns = projectTrack([
      [
        { lat: 47.0, lon: 7.0 },
        { lat: 47.001, lon: 7.0 },
      ],
    ]);
    const [, , w, h] = ns.viewBox.split(' ').map(Number);
    expect(h).toBeGreaterThan(w);
  });

  it('throws on empty geometry', () => {
    expect(() => projectTrack([])).toThrow();
  });
});
