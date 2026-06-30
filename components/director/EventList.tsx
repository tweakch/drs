import { setEventStatus } from '@/app/(app)/director/actions';
import { InviteTeamForm } from './InviteTeamForm';
import type { EventRow } from '@/lib/db/queries';

const NEXT_STATUS: Record<string, string | undefined> = {
  draft: 'live',
  live: 'published',
};

export function EventList({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return <p className="text-dim">No events yet. Create your first event above.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {events.map((e) => {
        const next = NEXT_STATUS[e.status];
        return (
          <li key={e.id} className="rounded-md border border-line bg-asphalt p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-paint">{e.name}</span>
              <span className="rounded border border-line px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                {e.status}
              </span>
              {next ? (
                <form action={setEventStatus}>
                  <input type="hidden" name="eventId" value={e.id} />
                  <input type="hidden" name="status" value={next} />
                  <button
                    type="submit"
                    className="rounded border border-warn px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-paint hover:bg-warn/10"
                  >
                    Set {next}
                  </button>
                </form>
              ) : null}
            </div>
            <InviteTeamForm eventId={e.id} />
          </li>
        );
      })}
    </ul>
  );
}
