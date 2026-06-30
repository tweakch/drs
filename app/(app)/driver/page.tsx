import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { getUserById } from '@/lib/db/queries';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProfileForm } from '@/components/driver/ProfileForm';

export default async function DriverPage() {
  const session = await requireRole('Driver');

  // Self-scoped: a Driver only ever loads their own row.
  const user = await getUserById(session.user.id);
  if (!user) notFound();

  const membership = session.user.memberships.find((m) => m.role === 'Driver');

  return (
    <div className="flex flex-col gap-5">
      <Card title="Your profile">
        <ProfileForm name={user.name ?? ''} />
        <p className="mt-3 text-[12px] text-dim">
          {membership?.teamId
            ? 'Assigned to a team for the current event.'
            : 'No team assignment yet.'}
        </p>
      </Card>
      <Card title="Personal metrics">
        <EmptyState message="Your pace, consistency and anonymized rank vs the field become available once results are published (analytics engine slice)." />
      </Card>
    </div>
  );
}
