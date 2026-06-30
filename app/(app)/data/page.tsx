import { DataView } from '@/components/data/DataView';
import { raceToRawLaps } from '@/lib/analytics/race-adapter';
import { getLatestRace } from '@/lib/race/latest';

// Lap-data intake: paste/CSV/sample/demo → editable grid + driver/kart tagging.
export default function DataPage() {
  const sample = raceToRawLaps(getLatestRace());
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-extrabold uppercase tracking-tight text-paint">Data</h2>
        <p className="text-sm text-dim">
          Load lap times, edit them, and tag each stint with its driver and kart.
        </p>
      </div>
      <DataView sample={sample} />
    </div>
  );
}
