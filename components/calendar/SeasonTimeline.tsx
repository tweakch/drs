import Link from 'next/link';
import { CircuitShape } from '@/components/circuits/CircuitShape';
import { trackBySlug } from '@/lib/entities/registry';
import type { CalendarEvent } from '@/lib/entities/types';

// The 2026 season as a chronological rail, grouped by month. Time is the structure,
// so this is the one place a sequence (and its dates) genuinely carries meaning.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function monthLabel(iso: string): string {
  return `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
}

export function SeasonTimeline({ events }: { events: CalendarEvent[] }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const months: { key: string; label: string; events: CalendarEvent[] }[] = [];
  for (const e of sorted) {
    const key = e.date.slice(0, 7);
    const group = months.find((m) => m.key === key);
    if (group) group.events.push(e);
    else months.push({ key, label: monthLabel(e.date), events: [e] });
  }

  return (
    <div className="space-y-6">
      {months.map((m) => (
        <section key={m.key}>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-muted">
            {m.label}
          </h2>
          <div className="divide-y divide-line/60 rounded-lg border border-line bg-asphalt-2">
            {m.events.map((e) => {
              const track = trackBySlug(e.trackSlug);
              return (
                <div key={e.slug} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-10 shrink-0 text-center">
                    <div className="font-mono text-xl font-bold tabular-nums leading-none text-paint">
                      {e.date.slice(8, 10)}
                    </div>
                  </div>
                  {track ? (
                    <Link href={`/circuits/${track.slug}`} className="shrink-0">
                      <CircuitShape
                        track={track}
                        className="h-10 w-12 opacity-80 hover:opacity-100"
                      />
                    </Link>
                  ) : (
                    <div className="h-10 w-12 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-paint">{e.name}</div>
                    <div className="font-mono text-[11px] text-dim">
                      {track ? `${track.name} · ${track.cantonCode}` : e.trackSlug} · {e.format}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${e.entry === 'open' ? 'border border-good/40 text-good' : 'border border-warn/40 text-warn'}`}
                    >
                      {e.entry === 'open' ? '🏁 open' : '🪪 licensed'}
                    </span>
                    {e.spectatorOpen ? <span title="Spectators welcome">👀</span> : null}
                    {e.hasData ? (
                      <Link
                        href="/race"
                        className="rounded border border-sbest/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-sbest hover:bg-sbest/10"
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="w-14 text-right text-[11px] uppercase tracking-[0.08em] text-dim">
                        no data
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
