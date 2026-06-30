import { CantonCoverage } from '@/components/circuits/CantonCoverage';
import { CircuitCard } from '@/components/circuits/CircuitCard';
import { cantonCoverage } from '@/lib/entities/cantons';
import { TRACKS } from '@/lib/entities/registry';

// The Circuits atlas — the world-layer showpiece. A registry of Swiss kart tracks
// rendered as a collection of circuit silhouettes; Wohlen is the one traced jewel.
export default function CircuitsPage() {
  // Lead with the traced reference, then the ASS competition circuits, then the rest.
  const tracks = [...TRACKS].sort((a, b) => {
    const rank = (t: (typeof TRACKS)[number]) =>
      (t.shape === 'traced' ? 0 : 1) +
      (t.assHomologated ? 0 : 2) +
      (t.status === 'operating' ? 0 : 4);
    return rank(a) - rank(b) || a.name.localeCompare(b.name);
  });
  const stats = {
    tracks: TRACKS.length,
    cantons: cantonCoverage(TRACKS).covered.length,
    ass: TRACKS.filter((t) => t.assHomologated).length,
    traced: TRACKS.filter((t) => t.shape === 'traced').length,
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-hot">
          The atlas · Swiss karting
        </div>
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-paint">
          Circuits
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px] tabular-nums text-muted">
          <span>
            <span className="text-paint">{stats.tracks}</span> tracks
          </span>
          <span>
            <span className="text-paint">{stats.cantons}</span> cantons
          </span>
          <span>
            <span className="text-hot">{stats.ass}</span> ASS competition circuits
          </span>
          <span>
            <span className="text-sbest">{stats.traced}</span> traced
          </span>
        </div>
      </header>

      <CantonCoverage tracks={TRACKS} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tracks.map((t) => (
          <CircuitCard key={t.slug} track={t} />
        ))}
      </div>

      <p className="text-[12px] text-dim">
        {stats.traced} of {stats.tracks} circuits traced so far — Wohlen and Lyss, projected from
        their OpenStreetMap ways. Every ghost outline is an open invitation: trace a circuit and it
        lights up across the app.
      </p>
    </div>
  );
}
