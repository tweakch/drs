'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';
import { updateDisplayName as dbUpdateDisplayName } from '@/lib/db/queries';

export interface ActionState {
  ok: boolean;
  message: string;
}

/** Update only the caller's own display name — no other write paths exist. */
export async function updateDisplayName(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole('Driver');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, message: 'Display name cannot be empty.' };

  await dbUpdateDisplayName(session.user.id, name);
  revalidatePath('/driver');
  return { ok: true, message: 'Saved.' };
}
