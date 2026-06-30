'use client';

import { useActionState } from 'react';
import { inviteTeam, type ActionState } from '@/app/(app)/director/actions';

export function InviteTeamForm({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(inviteTeam, null);

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="team@example.com"
          className="flex-1 rounded-md border border-line bg-asphalt px-2 py-1 text-[13px] text-paint outline-none focus:border-cool"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-cool px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-paint hover:bg-cool/10 disabled:opacity-50"
        >
          Invite Team
        </button>
      </div>
      {state ? (
        <p className={`text-[12px] ${state.ok ? 'text-good' : 'text-hot'}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
