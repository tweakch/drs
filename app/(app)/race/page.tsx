import { analyse, buildInsights } from '@/lib/analytics';
import { raceToRawLaps } from '@/lib/analytics/race-adapter';
import { raceSummary } from '@/lib/analytics/summary';
import { ClassificationTable } from '@/components/race/ClassificationTable';
import { Insights } from '@/components/race/Insights';
import { PaceConsistency } from '@/components/race/PaceConsistency';
import { PaceTrace } from '@/components/race/PaceTrace';
import { PositionChart } from '@/components/race/PositionChart';
import { PitWallHeader } from '@/components/race/PitWallHeader';
import { getLatestRace } from '@/lib/race/latest';
import { WOHLEN } from '@/lib/race/track-meta';

// One-line verdict — the story of the race, led from the top.
function raceVerdict(data: ReturnType<typeof analyse>): string {
  const winner = data.find((d) => d.pos === 1);
  if (!winner) return '';
  const fastest = [...data].sort((a, b) => a.best - b.best)[0];
  if (winner.name === fastest.name)
    return `${winner.name} controlled it from the front — fastest lap of the field and the win.`;
  return `${winner.name} led on distance; ${fastest.name} had the outright pace but never converted it.`;
}

export default function RaceView() {
  const race = getLatestRace();
  const data = analyse(raceToRawLaps(race));
  const summary = raceSummary(data);
  const insights = buildInsights(data);

  return (
    <div className="relative">
      {/* Ambient track watermark — establishes place. */}
      <svg
        viewBox="310 40 280 340"
        aria-hidden
        className="pointer-events-none absolute -right-10 top-24 -z-10 h-[520px] w-[520px] opacity-[0.04]"
      >
        <path
          d={race.trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-paint"
        />
      </svg>

      <PitWallHeader
        track={WOHLEN}
        eventLabel="2H GP"
        dateLabel="28 June 2026"
        round="Round 3 of 6"
        summary={summary}
        verdict={raceVerdict(data)}
        trackPath={race.trackPath}
      />

      <div className="space-y-6 pt-6">
        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            01 · Classification
          </h3>
          <ClassificationTable data={data} />
        </section>
        <PaceTrace data={data} />
        <PaceConsistency data={data} />
        <PositionChart data={data} />
        <Insights insights={insights} />
      </div>
    </div>
  );
}
