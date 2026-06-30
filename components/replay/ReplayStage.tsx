'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cleanLaps, median } from '@/lib/analytics';
import type { Race } from '@/lib/race/sample-race';
import { positionAt } from '@/lib/race/replay-position';
import { standingsAt } from '@/lib/race/standings';
import { ReplayLeaderboard } from './ReplayLeaderboard';

// Full /replay view: a controllable race timeline (ledger P4–P7) built on the same
// pure positionAt/standingsAt as the landing replay.

const PALETTE = ['fill-hot', 'fill-cool', 'fill-good', 'fill-warn', 'fill-paint'];
const LABEL_FILL = ['hot', 'cool', 'good', 'warn', 'paint'];
const VIEW_BOX = '300 20 300 380';

type LabelMode = 'kart' | 'team' | 'driver';
type GapMode = 'ahead' | 'leader';

function Btn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] ${active ? 'border-hot text-paint' : 'border-line text-muted hover:text-paint'}`}
    >
      {children}
    </button>
  );
}

// Seat index per lap, from pit-lap boundaries (mirror of splitStints' threshold).
function seatsByLap(laps: number[]): number[] {
  const cl = cleanLaps(laps).clean;
  const racingMed = median(cl.length ? cl : laps);
  const pit = racingMed * 1.35;
  const seats: number[] = [];
  let seat = 0;
  let stintLen = 0;
  for (let i = 0; i < laps.length; i++) {
    seats[i] = seat;
    if (laps[i] > pit && stintLen >= 3) {
      seat++;
      stintLen = 0;
    } else {
      stintLen++;
    }
  }
  return seats;
}

function clock(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ReplayStage({ race }: { race: Race }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
  const speedRef = useRef(6);
  const timeRef = useRef(0);

  const [raceTime, setRaceTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(6);
  const [labelMode, setLabelMode] = useState<LabelMode>('kart');
  const [gapMode, setGapMode] = useState<GapMode>('ahead');

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Period = the shortest team total, so no kart wraps within [0, period).
  const period = useMemo(
    () => Math.min(...race.teams.map((t) => t.laps.reduce((a, b) => a + b, 0))),
    [race],
  );
  const seats = useMemo(() => race.teams.map((t) => seatsByLap(t.laps)), [race]);
  const standings = useMemo(() => standingsAt(race.teams, raceTime), [race.teams, raceTime]);

  // Placement: runs whenever the time, the label mode, or the race changes — so a
  // paused scrub and a label switch both repaint the markers.
  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const length = pathEl.getTotalLength();
    race.teams.forEach((team, i) => {
      const g = markerRefs.current[i];
      if (!g) return;
      const { lap, frac } = positionAt(team.laps, raceTime);
      const p = pathEl.getPointAtLength(frac * length);
      g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      const label = g.querySelector('text.lbl');
      if (label) {
        label.textContent =
          labelMode === 'team'
            ? team.name
            : labelMode === 'kart'
              ? String(team.kart)
              : `Seat ${(seats[i][lap] ?? 0) + 1}`;
      }
    });
  }, [race, raceTime, labelMode, seats]);

  // Clock: advance race time while playing (respect reduced motion).
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last === null) last = now;
      let next = timeRef.current + ((now - last) / 1000) * speedRef.current;
      last = now;
      if (next >= period) next -= period; // loop
      timeRef.current = next;
      setRaceTime(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, period]);

  const onSeek = (v: number) => {
    timeRef.current = v;
    setRaceTime(v);
  };

  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <ReplayLeaderboard standings={standings} gapMode={gapMode} />
        <svg
          viewBox={VIEW_BOX}
          role="img"
          aria-label={`Replay of ${race.name}`}
          className="h-auto w-full min-w-0 sm:flex-1"
        >
          <path
            ref={pathRef}
            d={race.trackPath}
            fill="none"
            className="stroke-line"
            strokeWidth={14}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {race.teams.map((team, i) => (
            <g
              key={team.kart}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
            >
              <circle
                r={7}
                className={`${PALETTE[i % PALETTE.length]} stroke-asphalt`}
                strokeWidth={2}
              />
              <text
                className={`lbl fill-${LABEL_FILL[i % LABEL_FILL.length]}`}
                x={10}
                y={3}
                fontSize={11}
                fontWeight={700}
              >
                {String(team.kart)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md border border-hot bg-hot/10 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-paint hover:bg-hot/20"
          >
            {playing ? '❚❚ Pause' : '▶ Play'}
          </button>
          <span className="w-16 font-mono text-[12px] tabular-nums text-dim">
            {clock(raceTime)} / {clock(period)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.floor(period)}
            step={1}
            value={Math.floor(raceTime)}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek"
            className="h-1 flex-1 cursor-pointer accent-hot"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Speed
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Speed"
              className="h-1 w-28 cursor-pointer accent-hot"
            />
            <span className="w-6 font-mono tabular-nums text-paint">{speed}×</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Labels
            </span>
            <Btn active={labelMode === 'team'} onClick={() => setLabelMode('team')}>
              Team
            </Btn>
            <Btn active={labelMode === 'driver'} onClick={() => setLabelMode('driver')}>
              Driver
            </Btn>
            <Btn active={labelMode === 'kart'} onClick={() => setLabelMode('kart')}>
              Kart
            </Btn>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Gap
            </span>
            <Btn active={gapMode === 'leader'} onClick={() => setGapMode('leader')}>
              Leader
            </Btn>
            <Btn active={gapMode === 'ahead'} onClick={() => setGapMode('ahead')}>
              Ahead
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
