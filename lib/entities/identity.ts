// Driver identity resolver — the single place that decides what a driver reveals.
// Every view renders a driver through `publicDriver()` / `displayName()`, so a
// driver's choice (Named / Alias / Mystery + per-field toggles) is honoured
// everywhere: leaderboard, stints, replay labels, Detektiv. Pure and testable.

import type { DriverProfile, PublicDriver, Socials } from './types';

/** A stable, non-identifying codename for a masked driver. */
function codename(p: DriverProfile): string {
  if (p.number != null) return `Driver #${p.number}`;
  if (p.abbreviation) return `Driver ${p.abbreviation.toUpperCase()}`;
  return 'Mystery driver';
}

/** The name to show, per display mode. */
export function displayName(p: DriverProfile): string {
  switch (p.displayMode) {
    case 'named':
      return p.fullName || p.alias || codename(p);
    case 'alias':
      return p.alias || codename(p);
    case 'mystery':
      return codename(p);
  }
}

function cleanSocials(s?: Socials): Socials | undefined {
  if (!s) return undefined;
  const out: Socials = {};
  if (s.instagram) out.instagram = s.instagram;
  if (s.x) out.x = s.x;
  if (s.website) out.website = s.website;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Reduce a stored {@link DriverProfile} to only what may be shown publicly.
 *
 * - `mystery` withholds everything identifying: name → codename, no nationality,
 *   no socials, no avatar (the UI shows a silhouette).
 * - `named` / `alias` reveal the chosen name and only the fields the driver has
 *   opted to show via `visibility`.
 */
export function publicDriver(p: DriverProfile): PublicDriver {
  const masked = p.displayMode === 'mystery';
  const v = p.visibility;
  return {
    id: p.id,
    name: displayName(p),
    mode: p.displayMode,
    abbreviation: masked ? undefined : p.abbreviation,
    number: p.number,
    nationality: !masked && v.nationality ? p.nationality : undefined,
    avatarUrl: masked ? null : (p.avatarUrl ?? null),
    socials: !masked && v.socials ? cleanSocials(p.socials) : undefined,
    masked,
  };
}

/** Whether a driver's kart/seat history may be shown (masked drivers still race). */
export function showsKartHistory(p: DriverProfile): boolean {
  return p.displayMode !== 'mystery' && p.visibility.kartHistory;
}

/** Whether a driver's team affiliation may be shown. */
export function showsTeam(p: DriverProfile): boolean {
  return p.displayMode !== 'mystery' && p.visibility.team;
}
