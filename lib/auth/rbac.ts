// The single authorization choke point (DRS-0003). Deny-by-default; cross-tenant
// access resolves to Next's notFound() (404 over 403, so existence isn't leaked).
//
// Pure predicates (isAdmin / hasRole / can) are testable with plain in-memory
// session objects; the async require* wrappers read the real DB-backed session.

import { notFound } from 'next/navigation';
import { resolveScope, type ScopeArgs } from './scope';
import type { PrincipalSession, Role } from './types';

// --- Pure predicates -------------------------------------------------------

/** Platform-admin flag — the only cross-tenant capability. */
export function isAdmin(session: PrincipalSession | null | undefined): boolean {
  return Boolean(session?.user?.isPlatformAdmin);
}

/** True when the caller holds `role` (admin satisfies any role). */
export function hasRole(session: PrincipalSession | null | undefined, role: Role): boolean {
  if (!session?.user) return false;
  if (role === 'Admin') return isAdmin(session);
  if (isAdmin(session)) return true;
  return session.user.memberships.some((m) => m.role === role);
}

export type Action = 'view' | 'manage' | 'invite';
export interface Resource {
  type: 'platform' | 'event' | 'team' | 'driver' | 'user';
  eventId?: string | null;
  teamId?: string | null;
}

/** Capability check within the caller's resolved scope. Deny by default. */
export function can(
  session: PrincipalSession | null | undefined,
  action: Action,
  resource: Resource,
): boolean {
  if (!session?.user) return false;
  if (isAdmin(session)) return true;
  if (resource.type === 'platform') return false;

  const scope = resolveScope(session, { eventId: resource.eventId, teamId: resource.teamId });
  if (!scope) return false;

  switch (resource.type) {
    case 'event':
      return scope.role === 'Director' ? true : action === 'view';
    case 'team':
      if (scope.role === 'Director' || scope.role === 'Team') return true;
      return action === 'view';
    case 'driver':
      return action === 'view' || scope.role === 'Driver';
    default:
      return false;
  }
}

// --- Async server-side gates ----------------------------------------------

/** The DB-backed session, or null. Auth.js is imported lazily so the pure
 *  predicates above stay importable (and unit-testable) without loading the
 *  Node-only adapter/provider stack. */
export async function getSession() {
  const { auth } = await import('@/auth');
  return auth();
}

/** Require any authenticated user; 404 otherwise. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) notFound();
  return session;
}

/** Require the caller to hold `role`; 404 otherwise. */
export async function requireRole(role: Role) {
  const session = await requireUser();
  if (!hasRole(session, role)) notFound();
  return session;
}

/** Resolve the request scope from URL args vs memberships; 404 if none matches. */
export async function requireScope(args: ScopeArgs) {
  const session = await requireUser();
  const scope = resolveScope(session, args);
  if (!scope) notFound();
  return { session, scope };
}
