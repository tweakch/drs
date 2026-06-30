'use client';

import { useState } from 'react';
import { FMT, fmtDuration } from '@/lib/analytics';
import type { StintTier, TeamAnalysis, Tags } from '@/lib/analytics/types';

// Team view — per-team stint cards (ledger T1–T5).
const TIER_COLOR: Record<StintTier, string> = {
  Ace: 'text-hot',
  Core: 'text-cool',
  Backup: 'text-warn',
};
const TIER_BORDER: Record<StintTier, string> = {
  Ace: 'border-l-hot',
  Core: 'border-l-cool',
  Backup: 'border-l-warn',
};

function verdict(team: TeamAnalysis): { label: string; cls: string } {
  const aces = team.stints.filter((s) => s.tier === 'Ace').length;
  const weak = team.stints.filter((s) => s.tier === 'Backup').length;
  if (aces > weak) return { label: 'strong driver pool', cls: 'text-hot' };
  if (weak > aces) return { label: 'weak link present', cls: 'text-warn' };
  return { label: 'balanced lineup', cls: 'text-cool' };
}

export function StintCards({ data, tags }: { data: TeamAnalysis[]; tags: Tags }) {
  // Local editable copy of the driver/kart tags (T4). Keyed "team::stint::kind".
  const [edits, setEdits] = useState<Record<string, string>>({});
  const tagVal = (team: string, i: number, kind: 'drivers' | 'karts') =>
    edits[`${team}::${i}::${kind}`] ?? tags[kind][team]?.[i] ?? '';
  const setTag = (team: string, i: number, kind: 'drivers' | 'karts', v: string) =>
    setEdits((p) => ({ ...p, [`${team}::${i}::${kind}`]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-hot" /> Ace — fastest quartile
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-cool" /> Core — mid pack
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-warn" /> Backup — slowest quartile
        </span>
      </div>

      {data.map((team) => {
        const v = verdict(team);
        return (
          <section key={team.name} className="rounded-lg border border-line bg-asphalt-2 p-4">
            <h3 className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: team.color }}
              />
              <span className="font-extrabold uppercase tracking-tight text-paint">
                {team.name}
              </span>
              <span className="text-[11px] text-dim">· {team.stints.length} stints</span>
              <span className={`text-[11px] font-bold uppercase tracking-[0.08em] ${v.cls}`}>
                {v.label}
              </span>
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {team.stints.map((s, i) => {
                const tier = s.tier ?? 'Core';
                return (
                  <div
                    key={s.idx}
                    className={`rounded-md border border-l-2 border-line ${TIER_BORDER[tier]} bg-asphalt p-2.5`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                        Stint {s.idx} · {s.n}L
                      </span>
                      <span className={`text-[11px] font-bold ${TIER_COLOR[tier]}`}>{tier}</span>
                    </div>
                    <input
                      value={tagVal(team.name, i, 'drivers')}
                      onChange={(e) => setTag(team.name, i, 'drivers', e.target.value)}
                      placeholder="Driver…"
                      className="mb-1.5 w-full rounded border border-line bg-asphalt-2 px-2 py-1 text-[12px] text-paint outline-none focus:border-cool"
                    />
                    <input
                      value={tagVal(team.name, i, 'karts')}
                      onChange={(e) => setTag(team.name, i, 'karts', e.target.value)}
                      placeholder="Kart #"
                      className="mb-2 w-full rounded border border-line bg-asphalt-2 px-2 py-1 font-mono text-[12px] text-cool outline-none focus:border-cool"
                    />
                    <div className="font-mono text-xl font-extrabold tabular-nums text-paint">
                      {FMT(s.median)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-dim">
                      best {FMT(s.best)} · σ{s.std.toFixed(2)} · L{s.start}–{s.end}
                    </div>
                    <div className="mt-0.5 text-[11px] text-dim">⏱ {fmtDuration(s.duration)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
