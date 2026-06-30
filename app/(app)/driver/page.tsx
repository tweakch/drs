import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { getDriverProfile, getUserById } from '@/lib/db/queries';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IdentityEditor } from '@/components/driver/IdentityEditor';
import { DEFAULT_VISIBILITY, type DriverProfile } from '@/lib/entities/types';

export default async function DriverPage() {
  const session = await requireRole('Driver');

  // Self-scoped: a Driver only ever loads their own row.
  const user = await getUserById(session.user.id);
  if (!user) notFound();

  // Their saved identity, or a sensible default seeded from the account name.
  const profile: DriverProfile = (await getDriverProfile(session.user.id)) ?? {
    id: session.user.id,
    userId: session.user.id,
    displayMode: 'alias',
    fullName: user.name ?? undefined,
    visibility: { ...DEFAULT_VISIBILITY },
  };

  return (
    <div className="flex flex-col gap-5">
      <Card title="Your race identity">
        <IdentityEditor initial={profile} />
      </Card>
      <Card title="Personal metrics">
        <EmptyState message="Your pace, consistency and anonymized rank vs the field appear here once your team's results are published." />
      </Card>
    </div>
  );
}
