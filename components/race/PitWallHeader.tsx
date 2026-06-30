import { FMT } from '@/lib/analytics';
import type { RaceSummary } from '@/lib/analytics/summary';
import type { TrackMeta } from '@/lib/race/track-meta';

// The Pit-Wall Header — the case identity for a race, carried like a timing monitor.
// Track silhouette · condensed title · a mono KPI strip · the one-line verdict.

const VIEW_BOX = '310 40 280 340';

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-dim">{label}</div>
      <div
        className={`font-mono text-xl leading-tight tabular-nums ${accent ? 'text-sbest' : 'text-paint'}`}
      >
        {value}
      </div>
      {sub ? <div className="truncate text-[11px] text-muted">{sub}</div> : null}
    </div>
  );
}

export function PitWallHeader({
  track,
  eventLabel,
  dateLabel,
  round,
  summary,
  verdict,
  trackPath,
}: {
  track: TrackMeta;
  eventLabel: string;
  dateLabel: string;
  round: string;
  summary: RaceSummary;
  verdict: string;
  trackPath: string;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-6 border-b border-line bg-stage/85 px-6 py-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* Traced circuit silhouette — the recurring shape token. */}
        <svg
          viewBox={VIEW_BOX}
          role="img"
          aria-label={`${track.name} circuit outline`}
          className="h-16 w-24 shrink-0"
        >
          <path
            d={trackPath}
            fill="none"
            className="stroke-sbest"
            strokeOpacity={0.85}
            strokeWidth={9}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Identity */}
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-hot">
            After-action review · {round}
          </div>
          <h1 className="font-display text-3xl font-bold uppercase leading-[0.95] tracking-tight text-paint sm:text-4xl">
            {track.name}
          </h1>
          <div className="mt-1 font-mono text-[12px] text-muted">
            {eventLabel} · {dateLabel} · {track.canton} ({track.cantonCode}) · since {track.opened}
          </div>
        </div>

        {/* Timing strip */}
        <div className="ml-auto flex flex-wrap items-start gap-x-6 gap-y-3">
          <Kpi label="Teams" value={String(summary.teams)} />
          <Kpi label="Laps" value={String(summary.laps)} />
          <Kpi
            label="Field best"
            value={FMT(summary.fieldBest)}
            sub={summary.fieldBestTeam}
            accent
          />
          <Kpi label="Avg CoV" value={`${summary.avgCov.toFixed(2)}%`} />
          <Kpi label="Track" value={`${track.lengthM} m`} sub={`${track.turns} turns`} />
        </div>
      </div>

      {/* The verdict — the story, led from the top. */}
      <p className="mt-3 max-w-4xl border-l-2 border-hot/60 pl-3 text-[15px] leading-snug text-paint">
        {verdict}
      </p>
    </header>
  );
}
