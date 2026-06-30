import Link from 'next/link';
import { CircuitShape } from './CircuitShape';
import type { Track } from '@/lib/entities/types';

// One circuit in the atlas grid. The shape leads; facts read like a spec sheet.
const SHAPE_NOTE: Record<Track['shape'], string> = {
  traced: 'traced ✓',
  external: '🔗 operator map',
  none: 'trace from OSM →',
};

const STATUS_NOTE: Partial<Record<Track['status'], string>> = {
  construction: 'opening ~2027',
  closed: 'closed',
};

export function CircuitCard({ track }: { track: Track }) {
  const specs = [
    track.lengthM ? `${track.lengthM} m` : null,
    track.turns ? `${track.turns} turns` : null,
    track.karts,
  ].filter(Boolean);

  return (
    <Link
      href={`/circuits/${track.slug}`}
      className="group flex flex-col rounded-lg border border-line bg-asphalt-2 p-4 transition-colors hover:border-sbest/50"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wide text-muted">
          {track.cantonCode}
        </span>
        {track.assHomologated ? (
          <span className="rounded border border-hot/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-hot">
            ASS
          </span>
        ) : track.status === 'construction' ? (
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-warn">
            building
          </span>
        ) : null}
      </div>

      <CircuitShape track={track} className="my-1 h-24 w-full" />

      <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-tight text-paint">
        {track.name}
      </h3>
      <div className="mt-0.5 font-mono text-[11px] text-muted">
        {track.canton} · {track.type}
      </div>
      {specs.length ? (
        <div className="mt-1 font-mono text-[11px] tabular-nums text-dim">{specs.join(' · ')}</div>
      ) : null}
      <div
        className={`mt-2 text-[10px] font-bold uppercase tracking-[0.12em] ${track.shape === 'traced' ? 'text-sbest' : 'text-dim group-hover:text-muted'}`}
      >
        {STATUS_NOTE[track.status] ?? SHAPE_NOTE[track.shape]}
      </div>
    </Link>
  );
}
