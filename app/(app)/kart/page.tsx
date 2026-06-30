import { analyse, kartLeaderboard } from '@/lib/analytics';
import { KartRatings } from '@/components/kart/KartRatings';
import { taggedDemoRace } from '@/lib/race/demo-tagged';

// Kart view — recovered hidden kart pace ratings (ledger K1–K4).
export default function KartPage() {
  const { raw, tags } = taggedDemoRace();
  const rows = kartLeaderboard(analyse(raw), tags);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">
          Kart pace ratings
        </h2>
        <p className="text-sm text-dim">
          Each rental&apos;s hidden pace, recovered from the race.{' '}
          <span className="text-dim">Demo data with rotating karts.</span>
        </p>
      </div>
      <KartRatings rows={rows} />
    </div>
  );
}
