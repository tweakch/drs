'use client';

import { useMemo, useState } from 'react';
import { detektivKey, solveKarts } from '@/lib/analytics/detektiv';
import type { TeamAnalysis } from '@/lib/analytics/types';

// Detektiv view — the kart constraint solver, interactive (ledger X1–X6).
type Data = Pick<TeamAnalysis, 'name' | 'laps' | 'hasGridLap' | 'stints'>[];

export function DetektivBoard({
  data,
  teamNos,
  boxStart,
}: {
  data: Data;
  teamNos: Record<string, string>;
  boxStart: string[];
}) {
  const [facts, setFacts] = useState<Record<string, string>>({});
  const sol = useMemo(
    () => solveKarts(data, { teamNos, boxStart, facts }),
    [data, teamNos, boxStart, facts],
  );

  const maxStints = Math.max(...data.map((d) => d.stints.length));
  const pct = Math.round(sol.confidence * 100);

  const pin = (team: string, st: number, value: string) =>
    setFacts((p) => {
      const next = { ...p };
      if (value) next[detektivKey(team, st)] = value;
      else delete next[detektivKey(team, st)];
      return next;
    });

  return (
    <div className="space-y-4">
      {/* X1 confidence meter */}
      <div className="rounded-lg border border-line bg-asphalt-2 p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Confidence
          </span>
          <span className="font-mono text-sm tabular-nums text-paint">
            {sol.resolved} / {sol.total} stints resolved · {pct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded bg-asphalt">
          <div className="h-full bg-good" style={{ width: `${pct}%` }} />
        </div>
        {Object.keys(facts).length ? (
          <button
            onClick={() => setFacts({})}
            className="mt-2 rounded border border-line px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-muted hover:text-paint"
          >
            Clear facts
          </button>
        ) : null}
      </div>

      {/* X2 kart pool */}
      <div className="rounded-lg border border-line bg-asphalt-2 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          Kart pool
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sol.karts.map((k) => (
            <span
              key={k}
              className={`rounded px-2 py-0.5 font-mono text-[12px] ${sol.boxCandidates.includes(k) ? 'border border-warn/50 text-warn' : 'border border-line text-paint'}`}
            >
              {k}
            </span>
          ))}
          <span className="ml-2 self-center text-[11px] text-dim">
            box: {sol.boxCandidates.join(', ')} ({sol.boxSize} resting)
          </span>
        </div>
      </div>

      {/* X3 stint grid */}
      <div className="overflow-x-auto rounded-lg border border-line bg-asphalt-2">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-muted">
              <th className="px-3 py-2.5">Team</th>
              {Array.from({ length: maxStints }, (_, st) => (
                <th key={st} className="px-3 py-2.5">
                  Stint {st + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.name} className="border-b border-line/50">
                <td className="px-3 py-2 font-semibold text-paint">{t.name}</td>
                {Array.from({ length: maxStints }, (_, st) => {
                  if (st >= t.stints.length)
                    return (
                      <td key={st} className="px-3 py-2 text-dim">
                        —
                      </td>
                    );
                  const c = sol.cand[detektivKey(t.name, st)] ?? [];
                  if (st === 0) {
                    return (
                      <td key={st} className="px-3 py-2">
                        <span className="font-mono font-bold text-cool">{c[0]}</span>
                        <span className="ml-1 text-[10px] uppercase text-dim">grid</span>
                      </td>
                    );
                  }
                  if (c.length === 1) {
                    return (
                      <td key={st} className="px-3 py-2">
                        <span className="font-mono font-bold text-good">{c[0]}</span>
                      </td>
                    );
                  }
                  // X4 candidate set + X5 pin dropdown
                  return (
                    <td key={st} className="px-3 py-2">
                      <select
                        value={facts[detektivKey(t.name, st)] ?? ''}
                        onChange={(e) => pin(t.name, st, e.target.value)}
                        className="rounded border border-line bg-asphalt px-1 py-0.5 font-mono text-[11px] text-paint outline-none focus:border-cool"
                      >
                        <option value="">{`{${c.join(',')}}`}</option>
                        {c.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-dim">
        Each team&apos;s transponder is fixed, but the physical kart rotates at every stop. The
        solver infers which kart each team drove from the grid karts and pit timing. Pin a known
        kart to cascade the constraints.
      </p>
    </div>
  );
}
