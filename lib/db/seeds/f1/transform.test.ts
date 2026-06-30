import { describe, it, expect } from 'vitest';
import type { ResultsRace, LapsRace } from './jolpica.ts';
import { parseLapTime, buildFixture, fixtureToSql } from './transform.ts';

describe('parseLapTime', () => {
  it('parses M:SS.mmm to seconds', () => {
    expect(parseLapTime('1:15.002')).toBeCloseTo(75.002, 3);
  });
  it('parses bare seconds', () => {
    expect(parseLapTime('53.4')).toBeCloseTo(53.4, 3);
  });
  it('parses a whole minute', () => {
    expect(parseLapTime('1:00.000')).toBe(60);
  });
  it('parses H:MM:SS.mmm', () => {
    expect(parseLapTime('1:01:00.000')).toBe(3660);
  });
  it('throws on garbage', () => {
    expect(() => parseLapTime('not-a-time')).toThrow();
  });
});

// Minimal Jolpica-shaped fixtures. Second driver carries an apostrophe to exercise
// SQL escaping.
const race: ResultsRace = {
  season: '2026',
  round: '8',
  raceName: 'Austrian Grand Prix',
  date: '2026-06-28',
  Circuit: {
    circuitId: 'red_bull_ring',
    circuitName: 'Red Bull Ring',
    Location: { locality: 'Spielberg', country: 'Austria' },
  },
  Results: [
    {
      number: '63',
      position: '1',
      grid: '1',
      status: 'Finished',
      Driver: {
        driverId: 'russell',
        code: 'RUS',
        permanentNumber: '63',
        givenName: 'George',
        familyName: 'Russell',
        nationality: 'British',
      },
      Constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German' },
      Time: { millis: '5197979' },
    },
    {
      number: '99',
      position: '2',
      grid: '4',
      status: 'Finished',
      Driver: {
        driverId: 'dambrosio',
        code: 'DAM',
        permanentNumber: '7',
        givenName: 'Jerome',
        familyName: "D'Ambrosio",
        nationality: 'Belgian',
      },
      Constructor: { constructorId: 'newteam', name: "O'Racing", nationality: 'Italian' },
    },
  ],
};

const laps: LapsRace['Laps'] = [
  {
    number: '2',
    Timings: [{ driverId: 'russell', time: '1:10.300' }],
  },
  {
    number: '1',
    Timings: [
      { driverId: 'russell', time: '1:15.002' },
      { driverId: 'dambrosio', time: '1:16.500' },
    ],
  },
];

describe('buildFixture', () => {
  const f = buildFixture({ race, laps, fetchedAt: '2026-06-30T00:00:00.000Z' });

  it('derives season/round/sourceRef', () => {
    expect(f.season).toBe(2026);
    expect(f.round).toBe(8);
    expect(f.sourceRef).toBe('f1:2026:8');
    expect(f.name).toBe('Austrian Grand Prix 2026');
  });

  it('resolves the track with a known length and a stand-in handled later', () => {
    expect(f.track.ref).toBe('red_bull_ring');
    expect(f.track.lengthM).toBe(4318);
    expect(f.track.country).toBe('Austria');
  });

  it('computes duration from the winner millis', () => {
    expect(f.durationS).toBe(5198);
  });

  it('dedupes constructors and assigns the known livery colour', () => {
    expect(f.constructors).toHaveLength(2);
    expect(f.constructors.find((c) => c.ref === 'mercedes')?.color).toBe('#27F4D2');
    // Unknown constructor still gets a (fallback) colour.
    expect(f.constructors.find((c) => c.ref === 'newteam')?.color).toMatch(/^#/);
  });

  it('builds one entry per car with laps sorted by index', () => {
    expect(f.entries).toHaveLength(2);
    const rus = f.entries.find((e) => e.driverRef === 'russell')!;
    expect(rus.sourceRef).toBe('f1:2026:8:russell');
    expect(rus.name).toBe('George Russell');
    expect(rus.laps.map((l) => l.idx)).toEqual([1, 2]);
    expect(rus.laps[0]!.timeS).toBeCloseTo(75.002, 3);
    expect(rus.laps[1]!.timeS).toBeCloseTo(70.3, 3);
  });
});

describe('fixtureToSql', () => {
  const f = buildFixture({ race, laps, fetchedAt: '2026-06-30T00:00:00.000Z' });
  const sql = fixtureToSql(f);

  it('upserts every entity on its natural key (idempotent)', () => {
    expect(sql).toContain('insert into tracks');
    expect(sql).toContain('on conflict (ref) do update');
    expect(sql).toContain('on conflict (source_ref) do update');
    expect(sql).toContain('on conflict (team_id, idx) do update');
  });

  it('stores the layout as jsonb and the race source_ref', () => {
    expect(sql).toContain('::jsonb');
    expect(sql).toContain("source_ref = 'f1:2026:8'");
  });

  it('escapes single quotes', () => {
    expect(sql).toContain("D''Ambrosio");
    expect(sql).toContain("O''Racing");
  });

  it('is deterministic (same fixture -> identical SQL)', () => {
    expect(fixtureToSql(f)).toBe(sql);
  });
});
