'use client';

import { useActionState } from 'react';
import { updateDisplayName, type ActionState } from '@/app/(app)/driver/actions';

export function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    updateDisplayName,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <label
        htmlFor="name"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
      >
        Display name
      </label>
      <div className="flex gap-2">
        <input
          id="name"
          name="name"
          required
          defaultValue={name}
          className="flex-1 rounded-md border border-line bg-asphalt px-3 py-2 text-sm text-paint outline-none focus:border-cool"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-hot bg-hot/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {state ? (
        <p className={`text-[12px] ${state.ok ? 'text-good' : 'text-hot'}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
