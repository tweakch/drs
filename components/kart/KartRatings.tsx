import { EmptyState } from '@/components/ui/EmptyState';
import type { KartRow } from '@/lib/analytics/types';

// Kart view — recovered hidden pace ratings (ledger K1–K4). Presentational.
export function KartRatings({ rows }: { rows: KartRow[] | null }) {
  // K4 — gate when the decomposition isn't estimable (no kart tags / no crossover).
  if (!rows || !rows.length) {
    return (
      <EmptyState
        title="Kart"
        message="Tag kart #s on each stint (Data view) to recover every rental's hidden pace rating. Needs karts shared across drivers."
      />
    );
  }

  const fastest = rows[0].effect;
  const slowestGap = Math.max(0.01, rows[rows.length - 1].effect - fastest);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-line bg-asphalt-2">
        <table className="w-full text-right text-[13px] tabular-nums">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-muted">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5 text-left">Kart</th>
              <th className="px-3 py-2.5" title="Pace offset vs an average kart (lower = faster)">
                Pace effect
              </th>
              <th className="px-3 py-2.5 text-left">vs fastest</th>
              <th className="px-3 py-2.5">Stints</th>
              <th className="px-3 py-2.5">Drivers</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rel = r.effect - fastest;
              const barW = Math.min(100, (rel / slowestGap) * 100);
              const barColor = rel < 0.2 ? 'bg-good' : rel < 0.5 ? 'bg-warn' : 'bg-hot';
              return (
                <tr key={r.kart} className="border-b border-line/50">
                  <td className="px-3 py-2 font-bold">{r.rank}</td>
                  <td className="px-3 py-2 text-left font-bold text-paint">Kart {r.kart}</td>
                  <td
                    className={`px-3 py-2 font-bold ${r.effect < -0.1 ? 'text-hot' : r.effect > 0.1 ? 'text-warn' : 'text-paint'}`}
                  >
                    {r.effect > 0 ? '+' : ''}
                    {r.effect.toFixed(2)}s
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right text-dim">+{rel.toFixed(2)}</span>
                      <div className="h-2 w-[120px] overflow-hidden rounded bg-asphalt">
                        <div className={`h-full ${barColor}`} style={{ width: `${barW}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.stints}</td>
                  <td className="px-3 py-2">{r.drivers}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-dim">
        Recovered from the race itself: because karts rotated across drivers, the model untangles
        which laps were the kart and which were the hands.{' '}
        <b className="text-paint">Negative = faster kart.</b>
      </p>
    </div>
  );
}
