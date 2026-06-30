'use client';

import { useMemo, useState } from 'react';
import { analyse, cleanLaps, median, parseInput, splitStints } from '@/lib/analytics';
import { generateDemoRace } from '@/lib/analytics/demo';
import type { RawLaps, Tags } from '@/lib/analytics/types';
import { ClassificationTable } from '@/components/race/ClassificationTable';

// Data view — intake + editable grid + driver/kart tagging (ledger D1–D8).
// Fully client-side: the engine is pure, so parse/split/analyse run in the browser.

function serialize(raw: RawLaps): string {
  return Object.entries(raw)
    .map(([name, laps]) => `${name}: ${laps.join(', ')}`)
    .join('\n');
}

const FORMAT_HINT = 'Paste "Team: 53.4, 54.1, 1:02.8 …" per line, or CSV "Kart,Lap,Time".';

export function DataView({ sample }: { sample: RawLaps }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<RawLaps | null>(null);
  const [tags, setTags] = useState<Tags>({ drivers: {}, karts: {} });
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = (raw: RawLaps, asText: string) => {
    setParsed(raw);
    setText(asText);
    setSelected(Object.keys(raw)[0] ?? null);
    setError(null);
  };

  const onAnalyse = () => {
    const raw = parseInput(text);
    if (!Object.keys(raw).length) {
      setError("Couldn't read any lap times — check the format and try again.");
      setParsed(null);
      return;
    }
    load(raw, text);
  };

  const data = useMemo(() => (parsed ? analyse(parsed) : []), [parsed]);
  const teamLaps = selected && parsed ? parsed[selected] : null;
  const racingMed = useMemo(() => {
    if (!teamLaps) return 0;
    const cl = cleanLaps(teamLaps).clean;
    return median(cl.length ? cl : teamLaps);
  }, [teamLaps]);
  const stints = useMemo(() => (teamLaps ? splitStints(teamLaps) : []), [teamLaps]);

  const editLap = (idx: number, value: string) => {
    if (!selected || !parsed) return;
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const next = { ...parsed, [selected]: parsed[selected].map((t, i) => (i === idx ? v : t)) };
    setParsed(next);
  };

  const setTag = (kind: 'drivers' | 'karts', stintIdx: number, value: string) => {
    if (!selected) return;
    setTags((prev) => {
      const arr = [...(prev[kind][selected] ?? [])];
      arr[stintIdx] = value;
      return { ...prev, [kind]: { ...prev[kind], [selected]: arr } };
    });
  };

  const totalLaps = parsed ? Object.values(parsed).reduce((n, l) => n + l.length, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Intake */}
      <div className="rounded-lg border border-line bg-asphalt-2 p-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          Intake
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder={FORMAT_HINT}
          className="w-full rounded-md border border-line bg-asphalt px-3 py-2 font-mono text-[12px] text-paint outline-none focus:border-cool"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={onAnalyse}
            className="rounded-md border border-hot bg-hot/10 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-paint hover:bg-hot/20"
          >
            Analyse
          </button>
          <button
            onClick={() => load(sample, serialize(sample))}
            className="rounded-md border border-line px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-muted hover:text-paint"
          >
            Load sample race
          </button>
          <button
            onClick={() => {
              const r = generateDemoRace(6);
              load(r, serialize(r));
            }}
            className="rounded-md border border-line px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-muted hover:text-paint"
          >
            Demo
          </button>
          <button
            onClick={() => {
              setParsed(null);
              setText('');
              setSelected(null);
              setTags({ drivers: {}, karts: {} });
              setError(null);
            }}
            className="rounded-md border border-line px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-muted hover:text-paint"
          >
            Clear
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-[12px] text-hot">{error}</p>
        ) : (
          <p className="mt-2 text-[11px] text-dim">{FORMAT_HINT}</p>
        )}
      </div>

      {parsed ? (
        <>
          <p className="text-sm text-dim">
            <span className="font-bold text-paint">{Object.keys(parsed).length}</span> teams ·{' '}
            <span className="font-bold text-paint">{totalLaps}</span> laps loaded.
          </p>

          {/* Classification preview */}
          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Classification preview
            </h3>
            <ClassificationTable data={data} />
          </section>

          {/* Editable grid + tagging */}
          <section className="rounded-lg border border-line bg-asphalt-2 p-4">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Edit laps &amp; tag stints
            </h3>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {Object.keys(parsed).map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`rounded border px-2 py-1 text-[11px] font-semibold ${selected === name ? 'border-hot text-paint' : 'border-line text-muted hover:text-paint'}`}
                >
                  {name}
                </button>
              ))}
            </div>

            {teamLaps ? (
              <>
                <div className="mb-1 text-[11px] text-dim">
                  Lap times (s) — pit / driver-change laps are dimmed. Click a cell to edit.
                </div>
                <div className="flex flex-wrap gap-1">
                  {teamLaps.map((t, i) => {
                    const isPit = racingMed > 0 && t > racingMed * 1.35;
                    return (
                      <input
                        key={i}
                        value={t}
                        onChange={(e) => editLap(i, e.target.value)}
                        title={`Lap ${i + 1}`}
                        className={`w-[58px] rounded border border-line bg-asphalt px-1 py-0.5 text-right font-mono text-[11px] tabular-nums outline-none focus:border-cool ${isPit ? 'italic text-dim' : 'text-paint'}`}
                      />
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {stints.map((s, i) => (
                    <div key={s.idx} className="rounded-md border border-line/70 bg-asphalt p-2.5">
                      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                        Stint {s.idx} · {s.n}L · L{s.start}–{s.end}
                      </div>
                      <input
                        value={tags.drivers[selected!]?.[i] ?? ''}
                        onChange={(e) => setTag('drivers', i, e.target.value)}
                        placeholder="Driver…"
                        className="mb-1.5 w-full rounded border border-line bg-asphalt-2 px-2 py-1 text-[12px] text-paint outline-none focus:border-cool"
                      />
                      <input
                        value={tags.karts[selected!]?.[i] ?? ''}
                        onChange={(e) => setTag('karts', i, e.target.value)}
                        placeholder="Kart #"
                        className="w-full rounded border border-line bg-asphalt-2 px-2 py-1 font-mono text-[12px] text-cool outline-none focus:border-cool"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
