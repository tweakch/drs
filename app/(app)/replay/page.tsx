import { ReplayStage } from '@/components/replay/ReplayStage';
import { getLatestRace } from '@/lib/race/latest';

// Race replay — animated track with play/pause, seek, label and gap modes.
export default function ReplayPage() {
  const race = getLatestRace();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">Replay</h2>
        <p className="text-sm text-dim">{race.name}</p>
      </div>
      <ReplayStage race={race} />
    </div>
  );
}
