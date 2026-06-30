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

// Replay speed: one wall-clock second advances this many seconds of race time, so
// a ~2-hour race loops in a watchable ~3 minutes.
const SPEED = 45;

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
    let start: number | null = null;
    let lastEmit = 0;
    const tick = (now: number) => {
      if (start === null) start = now;
      const raceTime = ((now - start) / 1000) * SPEED;
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
    <div className="relative rounded-lg border border-line bg-asphalt-2 p-4">
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <ReplayLeaderboard standings={standings} />
      </div>
      <svg
        viewBox={VIEW_BOX}
        role="img"
        aria-label={`Animated track replay of ${race.name}`}
        className="h-auto w-full"
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
  );
}
