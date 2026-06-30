import { analyse } from '@/lib/analytics';
import { StintCards } from '@/components/team/StintCards';
import { taggedDemoRace } from '@/lib/race/demo-tagged';

// Team view — driver stints by team (ledger T1–T5). Runs on the tagged demo race
// (driver/kart rotation) so seats and tiers are coherent.
export default function StintsPage() {
  const { raw, tags } = taggedDemoRace();
  const data = analyse(raw);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">Stints</h2>
        <p className="text-sm text-dim">
          Each team&apos;s stints, tiered Ace / Core / Backup against the field.{' '}
          <span className="text-dim">Demo data with rotating karts.</span>
        </p>
      </div>
      <StintCards data={data} tags={tags} />
    </div>
  );
}
