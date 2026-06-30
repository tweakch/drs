'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';
import { createInvitation } from '@/lib/auth/invitations';

export interface ActionState {
  ok: boolean;
  message: string;
}

/** Invite a Driver to the caller's own team. */
export async function inviteDriver(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole('Team');
  const teamId = String(formData.get('teamId') ?? '');
  const email = String(formData.get('email') ?? '').trim();
  if (!teamId || !email) return { ok: false, message: 'Team and email are required.' };

  // Never trust the client teamId — it must match a Team membership the caller holds.
  const membership = session.user.memberships.find((m) => m.role === 'Team' && m.teamId === teamId);
  if (!membership) return { ok: false, message: 'That is not your team.' };

  try {
    const invite = await createInvitation({
      email,
      role: 'Driver',
      eventId: membership.eventId,
      teamId,
      invitedByRole: 'Team',
      invitedBy: session.user.id,
    });
    revalidatePath('/team');
    return { ok: true, message: `Invited ${email}. Link: /invite/${invite.rawToken}` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to invite.' };
  }
}
