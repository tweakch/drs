'use client';

import { useActionState } from 'react';
import { createEvent, type ActionState } from '@/app/(app)/director/actions';

export function CreateEventForm() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(createEvent, null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Wohlen 2h GP 2026"
          className="flex-1 rounded-md border border-line bg-asphalt px-3 py-2 text-sm text-paint outline-none focus:border-cool"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-hot bg-hot/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20 disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create event'}
        </button>
      </div>
      {state ? (
        <p className={`text-[12px] ${state.ok ? 'text-good' : 'text-hot'}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
