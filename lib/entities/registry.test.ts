import { describe, expect, it } from 'vitest';
import { EVENTS, TRACKS, eventsForTrack, trackBySlug } from './registry';

describe('registry — tracks', () => {
  it('has unique slugs', () => {
    expect(new Set(TRACKS.map((t) => t.slug)).size).toBe(TRACKS.length);
  });

  it('Wohlen is the traced reference circuit', () => {
    const w = trackBySlug('wohlen');
    expect(w).toMatchObject({ assHomologated: true, shape: 'traced', opened: 1962 });
    expect(w?.layout).toContain('M '); // an SVG path
  });

  it('marks exactly the three ASS competition circuits', () => {
    expect(
      TRACKS.filter((t) => t.assHomologated)
        .map((t) => t.slug)
        .sort(),
    ).toEqual(['lyss', 'magadino', 'wohlen']);
  });

  it('traced circuits carry a layout and its viewBox', () => {
    const traced = TRACKS.filter((t) => t.shape === 'traced');
    expect(traced.map((t) => t.slug).sort()).toEqual(['lyss', 'wohlen']);
    for (const t of traced) {
      expect(t.layout).toContain('M ');
      expect(t.layoutViewBox).toMatch(/^[\d.\s]+$/);
    }
  });
});

describe('registry — events', () => {
  it('has unique slugs and valid track references', () => {
    expect(new Set(EVENTS.map((e) => e.slug)).size).toBe(EVENTS.length);
    for (const e of EVENTS) expect(trackBySlug(e.trackSlug)).toBeDefined();
  });

  it('R3 of the Wohlen 2h GP is the only round with data', () => {
    const withData = EVENTS.filter((e) => e.hasData);
    expect(withData).toHaveLength(1);
    expect(withData[0].slug).toBe('wohlen-2hgp-r3');
  });

  it('lists the six Wohlen rounds via eventsForTrack', () => {
    const wohlen = eventsForTrack('wohlen').filter((e) => e.name.includes('2h GP'));
    expect(wohlen).toHaveLength(6);
  });
});
