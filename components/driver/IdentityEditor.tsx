'use client';

import { useActionState, useState } from 'react';
import { publicDriver, showsKartHistory, showsTeam } from '@/lib/entities/identity';
import type { DisplayMode, DriverProfile } from '@/lib/entities/types';
import { DriverIdentityCard } from './DriverIdentityCard';
import { updateIdentity, type ActionState } from '@/app/(app)/driver/actions';

const MODES: { value: DisplayMode; label: string; hint: string }[] = [
  { value: 'named', label: 'Named', hint: 'Show your real name and the fields you allow below.' },
  { value: 'alias', label: 'Alias', hint: 'Show a handle only — your real name stays private.' },
  {
    value: 'mystery',
    label: 'Mystery',
    hint: 'Race anonymously — a codename and your kart number, nothing else.',
  },
];

const VIS: { key: keyof DriverProfile['visibility']; label: string }[] = [
  { key: 'nationality', label: 'Nationality' },
  { key: 'socials', label: 'Socials' },
  { key: 'kartHistory', label: 'Kart history' },
  { key: 'team', label: 'Team' },
];

export function IdentityEditor({ initial }: { initial: DriverProfile }) {
  const [profile, setProfile] = useState<DriverProfile>(initial);
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    updateIdentity,
    null,
  );
  const set = <K extends keyof DriverProfile>(k: K, v: DriverProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));
  const setVis = (k: keyof DriverProfile['visibility'], v: boolean) =>
    setProfile((p) => ({ ...p, visibility: { ...p.visibility, [k]: v } }));

  const pub = publicDriver(profile);
  const field = (
    label: string,
    name: string,
    value: string,
    onChange: (v: string) => void,
    type = 'text',
  ) => (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-line bg-asphalt px-3 py-1.5 text-sm text-paint outline-none focus:border-cool"
      />
    </label>
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* Display mode */}
        <fieldset>
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            How you appear
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((m) => (
              <label
                key={m.value}
                className={`cursor-pointer rounded-lg border p-3 ${profile.displayMode === m.value ? 'border-hot bg-hot/5' : 'border-line hover:border-muted'}`}
              >
                <input
                  type="radio"
                  name="displayMode"
                  value={m.value}
                  checked={profile.displayMode === m.value}
                  onChange={() => set('displayMode', m.value)}
                  className="sr-only"
                />
                <div className="font-display text-base font-bold uppercase tracking-tight text-paint">
                  {m.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-dim">{m.hint}</div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Identity fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          {field('Full name', 'fullName', profile.fullName ?? '', (v) => set('fullName', v))}
          {field('Alias / handle', 'alias', profile.alias ?? '', (v) => set('alias', v))}
          {field('Abbreviation', 'abbreviation', profile.abbreviation ?? '', (v) =>
            set('abbreviation', v.toUpperCase().slice(0, 3)),
          )}
          {field(
            'Kart number',
            'number',
            profile.number != null ? String(profile.number) : '',
            (v) => set('number', v ? Number(v) : undefined),
            'number',
          )}
          {field('Nationality (e.g. CH)', 'nationality', profile.nationality ?? '', (v) =>
            set('nationality', v.toUpperCase().slice(0, 3)),
          )}
          {field('Instagram', 'instagram', profile.socials?.instagram ?? '', (v) =>
            set('socials', { ...profile.socials, instagram: v }),
          )}
        </div>

        {/* Per-field visibility */}
        <fieldset>
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Show on your profile
          </legend>
          <div className="flex flex-wrap gap-3">
            {VIS.map((v) => (
              <label key={v.key} className="flex items-center gap-2 text-[13px] text-paint">
                <input
                  type="checkbox"
                  name={`vis_${v.key}`}
                  checked={profile.visibility[v.key]}
                  onChange={(e) => setVis(v.key, e.target.checked)}
                  className="accent-hot"
                />
                {v.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-dim">
            Mystery mode overrides these — it hides everything but your codename and kart number.
          </p>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-hot bg-hot/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save identity'}
          </button>
          {state ? (
            <span className={`text-[12px] ${state.ok ? 'text-good' : 'text-hot'}`}>
              {state.message}
            </span>
          ) : null}
        </div>
      </div>

      {/* Live preview */}
      <aside className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Preview</div>
        <DriverIdentityCard driver={pub} />
        <ul className="space-y-1 text-[11px] text-dim">
          <li>Kart history {showsKartHistory(profile) ? 'shown' : 'hidden'}</li>
          <li>Team affiliation {showsTeam(profile) ? 'shown' : 'hidden'}</li>
        </ul>
      </aside>
    </form>
  );
}
