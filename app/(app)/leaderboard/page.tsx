import { analyse, driverLeaderboard, lineupRecos } from '@/lib/analytics';
import { Leaderboard } from '@/components/driver/Leaderboard';
import { Recos } from '@/components/driver/Recos';
import { taggedDemoRace } from '@/lib/race/demo-tagged';

// Driver leaderboard — ranks drivers on kart-adjusted pace (ledger V1–V6).
export default function LeaderboardPage() {
  const { raw, tags } = taggedDemoRace();
  const board = driverLeaderboard(analyse(raw), tags);
  const recos = lineupRecos(board);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">
          Driver leaderboard
        </h2>
        <p className="text-sm text-dim">
          Skill isolated from the luck of the kart draw.{' '}
          <span className="text-dim">Demo data with rotating karts.</span>
        </p>
      </div>
      <Leaderboard board={board} />
      <Recos recos={recos} />
    </div>
  );
}
