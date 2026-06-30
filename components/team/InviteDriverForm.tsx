'use client';

import { useActionState } from 'react';
import { inviteDriver, type ActionState } from '@/app/(app)/team/actions';

export function InviteDriverForm({ teamId }: { teamId: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(inviteDriver, null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="driver@example.com"
          className="flex-1 rounded-md border border-line bg-asphalt px-3 py-2 text-sm text-paint outline-none focus:border-cool"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-hot bg-hot/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20 disabled:opacity-50"
        >
          {pending ? 'Inviting…' : 'Invite Driver'}
        </button>
      </div>
      {state ? (
        <p className={`text-[12px] ${state.ok ? 'text-good' : 'text-hot'}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
