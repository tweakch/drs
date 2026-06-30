import { requireRole } from '@/lib/auth/rbac';
import { listEventsOwnedBy } from '@/lib/db/queries';
import { Card } from '@/components/ui/Card';
import { CreateEventForm } from '@/components/director/CreateEventForm';
import { EventList } from '@/components/director/EventList';

export default async function DirectorPage() {
  // Director console; non-Directors 404. Events are filtered to the owner.
  const session = await requireRole('Director');
  const events = await listEventsOwnedBy(session.user.id);

  return (
    <div className="flex flex-col gap-5">
      <Card title="Create event">
        <CreateEventForm />
      </Card>
      <Card title={`Your events (${events.length})`}>
        <EventList events={events} />
      </Card>
    </div>
  );
}
