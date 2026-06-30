import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { listTeamRoster, listTeamPendingInvites } from '@/lib/db/queries';
import { Card } from '@/components/ui/Card';
import { RosterList } from '@/components/team/RosterList';
import { InviteDriverForm } from '@/components/team/InviteDriverForm';

export default async function TeamPage() {
  const session = await requireRole('Team');

  // Scope is the caller's own Team membership — never a client-supplied team id.
  const membership = session.user.memberships.find((m) => m.role === 'Team' && m.teamId);
  if (!membership?.teamId) notFound();
  const teamId = membership.teamId;

  const [roster, pending] = await Promise.all([
    listTeamRoster(teamId),
    listTeamPendingInvites(teamId),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <Card title="Roster">
        <RosterList roster={roster} pending={pending} />
      </Card>
      <Card title="Invite a Driver">
        <InviteDriverForm teamId={teamId} />
      </Card>
    </div>
  );
}
