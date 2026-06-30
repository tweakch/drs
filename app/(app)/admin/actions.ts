'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';
import { createInvitation } from '@/lib/auth/invitations';

export interface ActionState {
  ok: boolean;
  message: string;
}

/** Admin-only: invite a Director (platform-wide). */
export async function inviteDirector(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole('Admin');
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { ok: false, message: 'Email is required.' };

  try {
    const invite = await createInvitation({
      email,
      role: 'Director',
      invitedByRole: 'Admin',
      invitedBy: session.user.id,
    });
    revalidatePath('/admin');
    return { ok: true, message: `Invited ${email}. Link: /invite/${invite.rawToken}` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to invite.' };
  }
}
