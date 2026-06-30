import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircuitShape } from '@/components/circuits/CircuitShape';
import { eventsForTrack, trackBySlug } from '@/lib/entities/registry';

const TYPE_LABEL = { indoor: 'Indoor', outdoor: 'Outdoor', both: 'Indoor + outdoor' } as const;

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dim">{label}</div>
      <div className="font-mono text-sm text-paint">{value}</div>
    </div>
  );
}

export default async function CircuitDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = trackBySlug(slug);
  if (!track) notFound();
  const events = eventsForTrack(slug);

  const facts: { label: string; value: string }[] = [
    { label: 'Canton', value: `${track.canton} (${track.cantonCode})` },
    { label: 'Type', value: TYPE_LABEL[track.type] },
    ...(track.lengthM ? [{ label: 'Length', value: `${track.lengthM} m` }] : []),
    ...(track.turns ? [{ label: 'Turns', value: String(track.turns) }] : []),
    ...(track.karts ? [{ label: 'Karts', value: track.karts }] : []),
    ...(track.opened ? [{ label: 'Opened', value: String(track.opened) }] : []),
    {
      label: 'Homologation',
      value: track.assHomologated ? 'ASS competition circuit' : '—',
    },
    { label: 'Status', value: track.status },
  ];

  return (
    <div className="space-y-6">
      <nav className="font-mono text-[12px] text-dim">
        <Link href="/circuits" className="hover:text-paint">
          Circuits
        </Link>
        <span className="px-1.5">▸</span>
        <span className="text-muted">{track.name}</span>
      </nav>

      <header className="flex flex-wrap items-center gap-6 border-b border-line pb-6">
        <div className="rounded-lg border border-line bg-asphalt-2 p-2">
          <CircuitShape track={track} className="h-28 w-40" />
        </div>
        <div>
          {track.assHomologated ? (
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-hot">
              ASS competition circuit
            </div>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-dim">
              {track.cantonCode} · {track.type}
            </div>
          )}
          <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-paint">
            {track.name}
          </h1>
          {track.website ? (
            <a
              href={track.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-mono text-[12px] text-cool hover:underline"
            >
              {track.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
            </a>
          ) : null}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {facts.map((f) => (
          <Fact key={f.label} {...f} />
        ))}
      </section>

      {track.shape !== 'traced' ? (
        <div className="rounded-lg border border-line bg-asphalt-2 p-4 text-[13px] text-muted">
          <span className="font-bold text-paint">No traced shape yet.</span>{' '}
          {track.shape === 'external'
            ? 'The operator publishes a track map; tracing it from OpenStreetMap would light up the Replay view.'
            : 'Trace this circuit from its OpenStreetMap way to add it to the atlas and the Replay view.'}
        </div>
      ) : null}

      <section>
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          2026 calendar
        </h2>
        {events.length ? (
          <div className="divide-y divide-line/60 rounded-lg border border-line bg-asphalt-2">
            {events.map((e) => (
              <div key={e.slug} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-24 shrink-0 font-mono text-[12px] tabular-nums text-dim">
                  {e.date}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-paint">{e.name}</span>
                <span className="hidden font-mono text-[11px] text-muted sm:inline">
                  {e.format}
                </span>
                {e.hasData ? (
                  <Link
                    href="/race"
                    className="rounded border border-sbest/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-sbest hover:bg-sbest/10"
                  >
                    Open
                  </Link>
                ) : (
                  <span className="text-[11px] uppercase tracking-[0.08em] text-dim">no data</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-asphalt-2 p-4 text-[13px] text-dim">
            No 2026 rounds recorded for this circuit yet.
          </div>
        )}
      </section>
    </div>
  );
}
