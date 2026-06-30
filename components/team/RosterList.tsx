import type { RosterRow, InviteDisplayRow } from '@/lib/db/queries';

export function RosterList({
  roster,
  pending,
}: {
  roster: RosterRow[];
  pending: InviteDisplayRow[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {roster.map((r) => (
        <li key={r.membershipId} className="flex items-center gap-2 text-sm">
          <span className="text-paint">{r.name ?? r.email ?? '—'}</span>
          <span className="rounded border border-line px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Driver
          </span>
        </li>
      ))}
      {pending.map((p) => (
        <li key={p.id} className="flex items-center gap-2 text-sm">
          <span className="text-dim">{p.email}</span>
          <span className="rounded border border-warn px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-warn">
            Pending
          </span>
        </li>
      ))}
      {roster.length === 0 && pending.length === 0 ? (
        <li className="text-dim">No drivers yet. Invite one below.</li>
      ) : null}
    </ul>
  );
}
