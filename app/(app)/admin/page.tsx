import { requireRole } from '@/lib/auth/rbac';
import { listUsers, listAllMemberships, listAllEvents, listPendingInvites } from '@/lib/db/queries';
import { Card } from '@/components/ui/Card';
import { InviteDirectorForm } from '@/components/admin/InviteDirectorForm';

export default async function AdminPage() {
  // Platform-admin only; non-admins get a 404 (server-side, deny by default).
  await requireRole('Admin');

  const [users, memberships, events, invites] = await Promise.all([
    listUsers(),
    listAllMemberships(),
    listAllEvents(),
    listPendingInvites(),
  ]);

  const membershipsByUser = new Map<string, typeof memberships>();
  for (const m of memberships) {
    const list = membershipsByUser.get(m.userId) ?? [];
    list.push(m);
    membershipsByUser.set(m.userId, list);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title="Invite a Director">
        <InviteDirectorForm />
      </Card>

      <Card title={`Users (${users.length})`}>
        <ul className="flex flex-col gap-2">
          {users.map((u) => {
            const ms = membershipsByUser.get(u.id) ?? [];
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-paint">{u.email ?? '—'}</span>
                {u.isPlatformAdmin ? <Badge label="Admin" /> : null}
                {ms.map((m) => (
                  <Badge key={m.id} label={`${m.role}${m.eventName ? ` · ${m.eventName}` : ''}`} />
                ))}
              </li>
            );
          })}
          {users.length === 0 ? <li className="text-dim">No users yet.</li> : null}
        </ul>
      </Card>

      <Card title={`Events (${events.length})`}>
        <ul className="flex flex-col gap-2">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-paint">{e.name}</span>
              <span className="text-dim">owner: {e.ownerEmail ?? '—'}</span>
              <Badge label={e.status} />
            </li>
          ))}
          {events.length === 0 ? <li className="text-dim">No events yet.</li> : null}
        </ul>
      </Card>

      <Card title={`Pending invitations (${invites.length})`}>
        <ul className="flex flex-col gap-2">
          {invites.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-paint">{i.email}</span>
              <Badge label={i.role} />
              {i.eventName ? <span className="text-dim">{i.eventName}</span> : null}
              <span className="text-dim">by {i.invitedByEmail ?? '—'}</span>
            </li>
          ))}
          {invites.length === 0 ? <li className="text-dim">No pending invitations.</li> : null}
        </ul>
      </Card>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded border border-line px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
      {label}
    </span>
  );
}
