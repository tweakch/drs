import type { Reco } from '@/lib/analytics/types';

// V6 — lineup recommendations. Presentational; logic is in the engine (lineupRecos).
export function Recos({ recos }: { recos: Reco[] }) {
  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
        Lineup recommendations
      </h3>
      <div className="space-y-2">
        {recos.map((r) => (
          <div
            key={r.mark}
            className="flex gap-3 rounded-md border border-line/60 bg-asphalt px-3 py-2"
          >
            <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-hot">
              {r.mark}
            </span>
            <span className="text-[13px] text-paint">{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
