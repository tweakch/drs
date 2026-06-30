'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';
import { updateDisplayName as dbUpdateDisplayName, upsertDriverProfile } from '@/lib/db/queries';
import type { DisplayMode, DriverProfile } from '@/lib/entities/types';

export interface ActionState {
  ok: boolean;
  message: string;
}

const MODES: DisplayMode[] = ['named', 'alias', 'mystery'];

/** Save the caller's own race identity (display mode + fields + visibility). */
export async function updateIdentity(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole('Driver');
  const str = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v || undefined;
  };
  const rawMode = String(formData.get('displayMode') ?? 'alias') as DisplayMode;
  const numRaw = str('number');

  const profile: DriverProfile = {
    id: session.user.id, // upsert keys on user_id; id is generated on first insert
    userId: session.user.id,
    displayMode: MODES.includes(rawMode) ? rawMode : 'alias',
    fullName: str('fullName'),
    alias: str('alias'),
    abbreviation: str('abbreviation'),
    number: numRaw && Number.isFinite(Number(numRaw)) ? Number(numRaw) : undefined,
    nationality: str('nationality'),
    socials: str('instagram') ? { instagram: str('instagram') } : undefined,
    visibility: {
      nationality: formData.get('vis_nationality') === 'on',
      socials: formData.get('vis_socials') === 'on',
      kartHistory: formData.get('vis_kartHistory') === 'on',
      team: formData.get('vis_team') === 'on',
    },
  };

  await upsertDriverProfile(session.user.id, profile);
  revalidatePath('/driver');
  return { ok: true, message: 'Identity saved.' };
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
