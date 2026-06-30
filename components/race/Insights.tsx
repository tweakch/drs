import { FMT, TRACK_PB } from '@/lib/analytics';
import type { Insight } from '@/lib/analytics/types';

// R12 — key findings. Composes prose from the engine's structured insights so the
// narrative lives in the view (the engine stays pure data).
function line(ins: Insight): string {
  const m = ins.metric ?? 0;
  switch (ins.mark) {
    case 'Win':
      return `${ins.subject} takes it — total race time ${FMT(m)}.`;
    case 'Pace':
      return `Fastest single lap: ${ins.subject} at ${FMT(m)} (${m - TRACK_PB >= 0 ? '+' : ''}${(m - TRACK_PB).toFixed(3)}s vs track PB).`;
    case 'Consistency':
      return `Most metronomic: ${ins.subject} (CoV ${m.toFixed(2)}%) — the kart to beat over a stint.`;
    case 'Fade':
      return `${ins.subject} dropped off hardest: +${m.toFixed(3)}s/lap — fade or fatigue.`;
    case 'Build':
      return `${ins.subject} got quicker through the race (${m.toFixed(3)}s/lap) — strong tyre management.`;
    case 'Gap':
      return `${ins.subject} had the raw pace but didn't win — lost to traffic, consistency or pit timing.`;
    case 'Upside':
      return `${ins.subject} has the most untapped pace — ${m.toFixed(2)}s between best lap and median.`;
    case 'Lineup':
      return `${ins.subject} has the widest driver spread — ${m.toFixed(2)}s between its fastest and slowest stint.`;
    default:
      return ins.subject;
  }
}

export function Insights({ insights }: { insights: Insight[] }) {
  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
        04 · Key findings
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {insights.map((ins) => (
          <div
            key={ins.mark}
            className="flex gap-3 rounded-md border border-line/60 bg-asphalt px-3 py-2"
          >
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-hot">
              {ins.mark}
            </span>
            <span className="text-[13px] text-paint">{line(ins)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
