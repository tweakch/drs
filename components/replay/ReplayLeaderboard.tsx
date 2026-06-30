import type { Standing } from '@/lib/race/standings';

// F1-broadcast-style timing tower overlaid on the replay. Pure presentation: it
// renders whatever standings it is handed; the live ranking + gap maths live in
// lib/race/standings (standingsAt), kept DOM-free and unit-tested.

// Dot colours mirror the on-track marker PALETTE (LandingReplay) by colour index,
// so a row and its kart marker read as the same car.
const DOT = ['bg-hot', 'bg-cool', 'bg-good', 'bg-warn', 'bg-paint'];

// The gap column: leader shows a flag, lapped cars show the lap deficit, everyone
// else shows the interval to the car ahead (the tower's default read).
function gapLabel(s: Standing): string {
  if (s.position === 1) return 'Leader';
  if (s.lapped) return `+${Math.floor(s.lapsToLeader)} L`;
  return `+${s.intervalSec.toFixed(1)}`;
}

export function ReplayLeaderboard({ standings }: { standings: Standing[] }) {
  const leader = standings[0];
  if (!leader) return null;

  return (
    <div className="w-[150px] rounded-md border border-line bg-asphalt/85 backdrop-blur-sm sm:w-[170px]">
      <div className="flex items-baseline justify-between border-b border-line px-2 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Live</span>
        <span className="font-mono text-[10px] tabular-nums text-dim">
          Lap {leader.lap}/{leader.totalLaps}
        </span>
      </div>
      <ol className="divide-y divide-line/60">
        {standings.map((s) => (
          <li key={s.kart} className="flex items-center gap-1.5 px-2 py-1 text-[11px] leading-none">
            <span className="w-3.5 text-right font-mono tabular-nums text-dim">{s.position}</span>
            <span
              className={`h-3 w-1 shrink-0 rounded-sm ${DOT[s.colorIndex % DOT.length]}`}
              aria-hidden
            />
            <span className="w-6 font-mono font-bold tabular-nums text-paint">{s.kart}</span>
            <span className="min-w-0 flex-1 truncate text-muted">{s.name}</span>
            <span
              className={`font-mono tabular-nums ${s.position === 1 ? 'text-cool' : 'text-dim'}`}
            >
              {gapLabel(s)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
