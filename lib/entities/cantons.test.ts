import { describe, expect, it } from 'vitest';
import { SWISS_CANTONS, cantonCoverage } from './cantons';
import { TRACKS } from './registry';

describe('cantonCoverage', () => {
  it('partitions all 26 cantons into covered + empty', () => {
    expect(SWISS_CANTONS).toHaveLength(26);
    const { covered, empty } = cantonCoverage(TRACKS);
    expect(covered.length + empty.length).toBe(26);
  });

  it('counts Aargau tracks (Wohlen, Spreitenbach, Cinema 8)', () => {
    const ag = cantonCoverage(TRACKS).covered.find((c) => c.code === 'AG');
    expect(ag?.count).toBe(3);
  });

  it('leaves cantons with no public track empty', () => {
    const empty = cantonCoverage(TRACKS).empty.map((c) => c.code);
    expect(empty).toContain('LU');
    expect(empty).not.toContain('AG');
  });
});
