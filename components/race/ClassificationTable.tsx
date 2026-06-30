'use client';

import { useMemo, useState } from 'react';
import { FMT } from '@/lib/analytics';
import type { TeamAnalysis } from '@/lib/analytics/types';

// R5 classification table · R6 column sorting · R7 gap column.
type Key = 'pos' | 'name' | 'n' | 'best' | 'median' | 'mean' | 'std' | 'cov' | 'deg';

const COLS: { key: Key; label: string; align: 'left' | 'right' }[] = [
  { key: 'pos', label: 'Pos', align: 'right' },
  { key: 'name', label: 'Team', align: 'left' },
  { key: 'n', label: 'Laps', align: 'right' },
  { key: 'best', label: 'Best', align: 'right' },
  { key: 'median', label: 'Median', align: 'right' },
  { key: 'mean', label: 'Mean·clean', align: 'right' },
  { key: 'std', label: 'σ', align: 'right' },
  { key: 'cov', label: 'CoV%', align: 'right' },
  { key: 'deg', label: 'Deg s/lap', align: 'right' },
];

export function ClassificationTable({ data }: { data: TeamAnalysis[] }) {
  const [sortKey, setSortKey] = useState<Key>('pos');
  const [dir, setDir] = useState<1 | -1>(1);
  const fieldBest = useMemo(() => Math.min(...data.map((d) => d.best)), [data]);

  const rows = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return cmp * dir;
    });
    return sorted;
  }, [data, sortKey, dir]);

  const onSort = (key: Key) => {
    if (key === sortKey) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setDir(1);
    }
  };

  const fmt = (k: Key, d: TeamAnalysis) => {
    switch (k) {
      case 'pos':
        return d.pos;
      case 'name':
        return d.name;
      case 'n':
        return d.n;
      case 'best':
      case 'median':
      case 'mean':
        return FMT(d[k]);
      case 'std':
        return d.std.toFixed(3);
      case 'cov':
        return d.cov.toFixed(2);
      case 'deg':
        return `${d.deg > 0 ? '+' : ''}${d.deg.toFixed(3)}`;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-asphalt-2">
      <table className="w-full text-right text-[13px] tabular-nums">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-muted">
            {COLS.map((c) => (
              <th
                key={c.key}
                onClick={() => onSort(c.key)}
                className={`cursor-pointer select-none px-3 py-2.5 font-bold hover:text-paint ${
                  c.align === 'left' ? 'text-left' : 'text-right'
                } ${sortKey === c.key ? 'text-paint' : ''}`}
              >
                {c.label}
                {sortKey === c.key ? (dir === 1 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            <th className="px-3 py-2.5 text-right font-bold">Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.name} className={`border-b border-line/50 ${d.pos === 1 ? 'bg-hot/8' : ''}`}>
              {COLS.map((c) => (
                <td key={c.key} className={`px-3 py-2 ${c.align === 'left' ? 'text-left' : ''}`}>
                  {c.key === 'name' ? (
                    <span className="inline-flex items-center gap-2 font-semibold text-paint">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ background: d.color }}
                      />
                      {d.name}
                    </span>
                  ) : c.key === 'pos' ? (
                    <span className={d.pos === 1 ? 'font-bold text-hot' : ''}>{d.pos}</span>
                  ) : c.key === 'best' ? (
                    <span
                      className={d.best === fieldBest ? 'font-bold text-sbest' : ''}
                      title={d.best === fieldBest ? 'Session best' : undefined}
                    >
                      {FMT(d.best)}
                    </span>
                  ) : (
                    fmt(c.key, d)
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-dim">{d.gap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
