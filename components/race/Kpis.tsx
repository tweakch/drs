import { FMT } from '@/lib/analytics';
import type { RaceSummary } from '@/lib/analytics/summary';

// R1–R4 — the four headline KPI cards. Pure presentation.
export function Kpis({ summary }: { summary: RaceSummary }) {
  const cards: { label: string; value: string; sub?: string }[] = [
    { label: 'Teams', value: String(summary.teams) },
    { label: 'Laps', value: String(summary.laps) },
    {
      label: 'Field best',
      value: FMT(summary.fieldBest),
      sub: `${summary.pbDelta >= 0 ? '+' : ''}${summary.pbDelta.toFixed(3)}s vs track PB · ${summary.fieldBestTeam}`,
    },
    { label: 'Avg CoV', value: `${summary.avgCov.toFixed(2)}%` },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-line bg-asphalt-2 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            {c.label}
          </div>
          <div className="mt-1 font-mono text-2xl font-extrabold tabular-nums text-paint">
            {c.value}
          </div>
          {c.sub ? <div className="mt-1 text-[11px] text-dim">{c.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}
