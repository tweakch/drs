import { describe, expect, it } from 'vitest';
import { analyse } from './engine';
import { raceSummary } from './summary';
import { raceToRawLaps } from './race-adapter';
import { REAL_RACE } from '@/lib/race/sample-race';

describe('raceSummary', () => {
  const data = analyse(raceToRawLaps(REAL_RACE));
  const s = raceSummary(data);

  it('counts the full field', () => {
    expect(s.teams).toBe(REAL_RACE.teams.length);
  });

  it('totals racing laps across teams', () => {
    expect(s.laps).toBe(data.reduce((n, d) => n + d.n, 0));
    expect(s.laps).toBeGreaterThan(0);
  });

  it('reports the field-best lap and who set it', () => {
    const best = Math.min(...data.map((d) => d.best));
    expect(s.fieldBest).toBe(best);
    expect(s.fieldBestTeam).toBe(data.find((d) => d.best === best)!.name);
  });

  it('returns a safe zero summary for an empty field', () => {
    expect(raceSummary([])).toMatchObject({ teams: 0, laps: 0, fieldBestTeam: '—' });
  });
});
