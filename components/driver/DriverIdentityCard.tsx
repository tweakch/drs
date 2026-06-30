import type { PublicDriver } from '@/lib/entities/types';

// How a driver appears to everyone else — rendered straight from publicDriver().
// Reused by the editor's live preview and (later) driver listings.
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function DriverIdentityCard({ driver }: { driver: PublicDriver }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-asphalt-2 p-4">
      {/* Avatar — a redacted silhouette when masked (Detektiv vibe). */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${
          driver.masked ? 'border border-dashed border-dim text-dim' : 'bg-raised text-paint'
        }`}
      >
        {driver.masked ? '?' : initials(driver.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {driver.number != null ? (
            <span className="font-mono text-[12px] font-bold text-sbest">#{driver.number}</span>
          ) : null}
          <span className="truncate font-display text-lg font-bold uppercase tracking-tight text-paint">
            {driver.name}
          </span>
          {driver.masked ? (
            <span className="rounded border border-dim px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-dim">
              Mystery
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
          {driver.abbreviation ? <span>{driver.abbreviation}</span> : null}
          {driver.nationality ? (
            <span className="rounded bg-raised px-1.5 py-0.5">{driver.nationality}</span>
          ) : null}
          {driver.socials?.instagram ? (
            <a href="#" className="text-cool hover:underline">
              {driver.socials.instagram}
            </a>
          ) : null}
          {driver.socials?.website ? (
            <a href="#" className="text-cool hover:underline">
              {driver.socials.website.replace(/^https?:\/\//, '')}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
