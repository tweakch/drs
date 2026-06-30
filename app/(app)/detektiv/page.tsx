import { analyse } from '@/lib/analytics';
import { DetektivBoard } from '@/components/detektiv/DetektivBoard';
import { detektivScenario } from '@/lib/race/demo-tagged';

// Kart Detektiv — infers which physical kart each team drove per stint (X1–X6).
export default function DetektivPage() {
  const { raw, teamNos, boxStart } = detektivScenario();
  const data = analyse(raw);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">
          Kart Detektiv
        </h2>
        <p className="text-sm text-dim">
          Which physical kart did each team drive? Recovered from grid karts and pit timing.{' '}
          <span className="text-dim">Demo scenario: 4 teams, 3 box karts.</span>
        </p>
      </div>
      <DetektivBoard data={data} teamNos={teamNos} boxStart={boxStart} />
    </div>
  );
}
