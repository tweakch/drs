import { EmptyState } from '@/components/ui/EmptyState';

export default function DataView() {
  return (
    <EmptyState
      title="Data"
      message="Lap-data intake lands here. Paste lap times or load the demo race (DRS-0003)."
    />
  );
}
