import { FMT } from '@/lib/analytics';
import type { DriverBoard, StintTier } from '@/lib/analytics/types';

// Driver leaderboard (ledger V1–V5). Presentational; ranking is done by the engine.
const TIER_BG: Record<StintTier, string> = {
  Ace: 'bg-hot/15 text-hot',
  Core: 'bg-cool/15 text-cool',
  Backup: 'bg-warn/15 text-warn',
};

export function Leaderboard({ board }: { board: DriverBoard }) {
  const { rows, effects, useAdjusted } = board;
  const minBest = Math.min(...rows.map((r) => r.best));

  const banner = useAdjusted
    ? `Kart-adjusted: drivers ranked on expected pace in an average kart. The model explains ${((effects?.r2 ?? 0) * 100).toFixed(0)}% of stint-time variance across ${effects?.nObs} tagged stints.`
    : effects
      ? 'Some stints are missing a kart # — ranking falls back to raw median (mixes driver skill with kart speed). Tag every stint to unlock kart-adjusted pace.'
      : 'Add kart #s to separate driver skill from kart pace. Drivers are ranked on raw median for now.';

  return (
    <div className="space-y-3">
      <div
        className={`rounded-md border px-3 py-2 text-[12px] ${useAdjusted ? 'border-good/40 bg-good/10 text-paint' : 'border-warn/40 bg-warn/10 text-paint'}`}
      >
        {banner}
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-asphalt-2">
        <table className="w-full text-right text-[13px] tabular-nums">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-muted">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5 text-left">Driver</th>
              <th className="px-3 py-2.5">Tier</th>
              <th className="px-3 py-2.5">Stints</th>
              <th className="px-3 py-2.5">Laps</th>
              <th className="px-3 py-2.5">Best</th>
              <th className="px-3 py-2.5">Median</th>
              {useAdjusted ? (
                <>
                  <th className="px-3 py-2.5" title="Expected lap in an average kart">
                    Adj pace
                  </th>
                  <th className="px-3 py-2.5" title="Median − adjusted = kart luck">
                    Kart Δ
                  </th>
                </>
              ) : null}
              <th className="px-3 py-2.5">σ</th>
              <th className="px-3 py-2.5">CoV%</th>
              <th className="px-3 py-2.5">Deg s/lap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const adjLap = (effects?.grand ?? 0) + (r.adj ?? 0);
              const luck = r.median - adjLap;
              const luckCls = luck > 0.15 ? 'text-warn' : luck < -0.15 ? 'text-good' : 'text-dim';
              return (
                <tr key={r.name} className="border-b border-line/50">
                  <td className="px-3 py-2 font-bold">{r.rank}</td>
                  <td className="px-3 py-2 text-left">
                    <div className="flex items-center gap-2 font-semibold text-paint">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ background: r.color }}
                      />
                      {r.name}
                    </div>
                    <div className="text-[11px] text-dim">
                      {r.team}
                      {r.karts.length ? ` · karts ${r.karts.join(',')}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TIER_BG[r.tier]}`}
                    >
                      {r.tier}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.stints}</td>
                  <td className="px-3 py-2">{r.laps}</td>
                  <td className={`px-3 py-2 ${r.best === minBest ? 'font-bold text-hot' : ''}`}>
                    {FMT(r.best)}
                  </td>
                  <td className="px-3 py-2">{FMT(r.median)}</td>
                  {useAdjusted ? (
                    <>
                      <td className="px-3 py-2 font-bold text-paint">{FMT(adjLap)}</td>
                      <td className={`px-3 py-2 ${luckCls}`}>
                        {luck > 0 ? '+' : ''}
                        {luck.toFixed(2)}s
                      </td>
                    </>
                  ) : null}
                  <td className="px-3 py-2">{r.std.toFixed(3)}</td>
                  <td className="px-3 py-2">{r.cov.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    {r.deg > 0 ? '+' : ''}
                    {r.deg.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
