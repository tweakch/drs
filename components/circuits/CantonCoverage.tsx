import { cantonCoverage } from '@/lib/entities/cantons';
import type { Track } from '@/lib/entities/types';

// The geographic story: which of the 26 cantons have a public track, which are blank.
// Empty cantons are shown, dimmed — the map of where karting hasn't reached yet.
export function CantonCoverage({ tracks }: { tracks: Track[] }) {
  const { covered, empty } = cantonCoverage(tracks);
  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          Coverage
        </span>
        <span className="font-mono text-[12px] tabular-nums text-dim">
          {covered.length} of {covered.length + empty.length} cantons
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {covered.map((c) => (
          <span
            key={c.code}
            title={`${c.name} · ${c.count} track${c.count > 1 ? 's' : ''}`}
            className="flex items-center gap-1 rounded border border-sbest/40 bg-sbest/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-paint"
          >
            {c.code}
            <span className="text-sbest">{c.count}</span>
          </span>
        ))}
        {empty.map((c) => (
          <span
            key={c.code}
            title={`${c.name} · no public track yet`}
            className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-dim"
          >
            {c.code}
          </span>
        ))}
      </div>
    </div>
  );
}
