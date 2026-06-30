// Per-request scope resolution (DRS-0003). The active scope is derived from the
// URL's event/team id checked against the caller's memberships — NEVER from a
// client-supplied "active scope". Pure function: no DB, no Next imports.

import type { PrincipalSession, ResolvedScope } from './types';

export interface ScopeArgs {
  eventId?: string | null;
  teamId?: string | null;
}

/**
 * Resolve the scope for a request. Returns the matching scope, or `null` when no
 * membership grants access (the caller turns null into a 404 — deny by default).
 *
 * - A platform admin resolves to a cross-tenant admin scope for any args.
 * - Otherwise a membership must match the requested event (and team, if asked).
 */
export function resolveScope(
  session: PrincipalSession | null | undefined,
  args: ScopeArgs = {},
): ResolvedScope | null {
  const user = session?.user;
  if (!user) return null;

  if (user.isPlatformAdmin) {
    return {
      role: 'Admin',
      eventId: args.eventId ?? null,
      teamId: args.teamId ?? null,
      driverId: null,
      isAdmin: true,
    };
  }

  const match = user.memberships.find((m) => {
    if (args.eventId != null && m.eventId !== args.eventId) return false;
    if (args.teamId != null && m.teamId !== args.teamId) return false;
    return true;
  });
  if (!match) return null;

  return {
    role: match.role,
    eventId: match.eventId,
    teamId: match.teamId,
    driverId: match.driverId,
    isAdmin: false,
  };
}
