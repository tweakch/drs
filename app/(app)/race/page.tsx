import { analyse, buildInsights } from '@/lib/analytics';
import { raceToRawLaps } from '@/lib/analytics/race-adapter';
import { raceSummary } from '@/lib/analytics/summary';
import { ClassificationTable } from '@/components/race/ClassificationTable';
import { Insights } from '@/components/race/Insights';
import { Kpis } from '@/components/race/Kpis';
import { PaceConsistency } from '@/components/race/PaceConsistency';
import { PaceTrace } from '@/components/race/PaceTrace';
import { getLatestRace } from '@/lib/race/latest';

// Race classification & analysis. The engine runs on the embedded sample race
// (DB-free, same seam as the landing replay); later swaps to a DB race unchanged.
export default function RaceView() {
  const race = getLatestRace();
  const data = analyse(raceToRawLaps(race));
  const summary = raceSummary(data);
  const insights = buildInsights(data);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">
          {race.name}
        </h2>
        <p className="text-sm text-dim">Classification, pace and the story of the race.</p>
      </div>
      <Kpis summary={summary} />
      <section>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          01 · Classification
        </h3>
        <ClassificationTable data={data} />
      </section>
      <PaceTrace data={data} />
      <PaceConsistency data={data} />
      <Insights insights={insights} />
    </div>
  );
}
