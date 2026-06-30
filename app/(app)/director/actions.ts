'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';
import { createInvitation } from '@/lib/auth/invitations';
import {
  createEvent as dbCreateEvent,
  getEventOwnedBy,
  setEventStatus as dbSetEventStatus,
} from '@/lib/db/queries';

export interface ActionState {
  ok: boolean;
  message: string;
}

const EVENT_STATUSES = ['draft', 'live', 'published', 'archived'] as const;

/** Create an event owned by the calling Director (status starts at 'draft'). */
export async function createEvent(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole('Director');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, message: 'Event name is required.' };

  await dbCreateEvent({ name, ownerId: session.user.id });
  revalidatePath('/director');
  return { ok: true, message: `Created "${name}".` };
}

/** Invite a Team to an event the caller owns. */
export async function inviteTeam(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole('Director');
  const eventId = String(formData.get('eventId') ?? '');
  const email = String(formData.get('email') ?? '').trim();
  if (!eventId || !email) return { ok: false, message: 'Event and email are required.' };

  // Ownership check in the query — never trust the client-supplied eventId.
  const event = await getEventOwnedBy(eventId, session.user.id);
  if (!event) return { ok: false, message: 'You do not own that event.' };

  try {
    const invite = await createInvitation({
      email,
      role: 'Team',
      eventId,
      invitedByRole: 'Director',
      invitedBy: session.user.id,
    });
    revalidatePath('/director');
    return { ok: true, message: `Invited ${email}. Link: /invite/${invite.rawToken}` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to invite.' };
  }
}

/** Move an owned event through draft → live → published (owner-scoped query). */
export async function setEventStatus(formData: FormData): Promise<void> {
  const session = await requireRole('Director');
  const eventId = String(formData.get('eventId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!eventId) return;
  if (!(EVENT_STATUSES as readonly string[]).includes(status)) return;

  await dbSetEventStatus(eventId, session.user.id, status);
  revalidatePath('/director');
}
