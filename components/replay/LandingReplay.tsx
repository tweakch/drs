'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Race } from '@/lib/race/sample-race';
import { positionAt } from '@/lib/race/replay-position';
import { standingsAt } from '@/lib/race/standings';
import { ReplayLeaderboard } from './ReplayLeaderboard';

// A simple, forever-looping race replay: one number-marker per kart sweeps the
// track path at a pace set by its lap times. The time→fraction math is pure
// (positionAt); this client component only does the DOM part — mapping a kart's
// lap fraction onto a point on the <path> via getPointAtLength inside a RAF loop.

// Marker colours cycle through the brand tokens (asphalt/paint/hot/cool/etc.).
const PALETTE = ['fill-hot', 'fill-cool', 'fill-good', 'fill-warn', 'fill-paint'];

// Replay speed = seconds of race time per wall-clock second. The viewer picks it
// on a slider: 1× is roughly real time (a ~52s lap takes ~52s on screen), 12× makes
// a lap take ~4s. Default to a calm, readable pace.
const MIN_SPEED = 1;
const MAX_SPEED = 12;
const DEFAULT_SPEED = 6;

// The on-track markers move every RAF frame, but the timing tower only needs to
// refresh a few times a second — throttle its React state so we don't re-render
// the whole field 60×/s.
const TOWER_REFRESH_MS = 200;

// viewBox framed around the TRACK_PATH bounds (x≈342..557, y≈54..366) with padding.
const VIEW_BOX = '310 30 280 360';

export function LandingReplay({ race }: { race: Race }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);

  // Elapsed race time (seconds), updated at TOWER_REFRESH_MS to drive the tower.
  const [elapsed, setElapsed] = useState(0);
  const standings = useMemo(() => standingsAt(race.teams, elapsed), [race.teams, elapsed]);

  // Viewer-controlled replay speed. The slider updates state (for the label) and a
  // ref the RAF loop reads, so dragging changes the rate without restarting it.
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const speedRef = useRef(DEFAULT_SPEED);

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const length = pathEl.getTotalLength();

    // Place every marker at the path point matching its lap fraction at raceTime.
    const place = (raceTime: number) => {
      race.teams.forEach((team, i) => {
        const g = markerRefs.current[i];
        if (!g) return;
        const { frac } = positionAt(team.laps, raceTime);
        const p = pathEl.getPointAtLength(frac * length);
        g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      });
    };

    // Respect reduced motion: render a single static frame, no animation loop.
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      // elapsed already initialises to 0, so the tower renders its starting grid.
      place(0);
      return;
    }

    let raf = 0;
    let lastNow: number | null = null;
    let raceTime = 0;
    let lastEmit = 0;
    const tick = (now: number) => {
      if (lastNow === null) lastNow = now;
      // Integrate at the current speed so dragging the slider changes the pace
      // going forward without teleporting the markers.
      raceTime += ((now - lastNow) / 1000) * speedRef.current;
      lastNow = now;
      place(raceTime);
      // Refresh the timing tower a few times a second, not every frame.
      if (now - lastEmit >= TOWER_REFRESH_MS) {
        lastEmit = now;
        setElapsed(raceTime);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [race]);

  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <ReplayLeaderboard standings={standings} />
        <svg
          viewBox={VIEW_BOX}
          role="img"
          aria-label={`Animated track replay of ${race.name}`}
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
                r={9}
                className={`${PALETTE[i % PALETTE.length]} stroke-asphalt`}
                strokeWidth={2}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-asphalt font-mono font-bold"
                fontSize={9}
              >
                {team.kart}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <label className="mt-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        <span>Speed</span>
        <input
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={1}
          value={speed}
          onChange={(e) => {
            const next = Number(e.target.value);
            setSpeed(next);
            speedRef.current = next;
          }}
          aria-label="Replay speed"
          className="h-1 flex-1 cursor-pointer accent-hot"
        />
        <span className="w-8 font-mono tabular-nums text-paint">{speed}×</span>
      </label>
    </div>
  );
}
