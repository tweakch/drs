import { SeasonTimeline } from '@/components/calendar/SeasonTimeline';
import { EVENTS } from '@/lib/entities/registry';

// The Calendar hub — the 2026 Swiss kart season as a chronological rail.
export default function CalendarPage() {
  const open = EVENTS.filter((e) => e.entry === 'open').length;
  const withData = EVENTS.filter((e) => e.hasData).length;
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-hot">
          The season · 2026
        </div>
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-paint">
          Calendar
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px] tabular-nums text-muted">
          <span>
            <span className="text-paint">{EVENTS.length}</span> rounds
          </span>
          <span>
            <span className="text-good">{open}</span> open entry
          </span>
          <span>
            <span className="text-sbest">{withData}</span> with data
          </span>
        </div>
      </header>

      <SeasonTimeline events={EVENTS} />

      <p className="text-[12px] text-dim">
        Mid-season, 2026. Only the Wohlen R3 round carries timing so far — open it to investigate;
        the rest of the season is waiting on its first dataset.
      </p>
    </div>
  );
}
