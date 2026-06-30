// Auth domain types (DRS-0003). Mirrors the Identity & access section of
// prompts/shared/entities.md. Pure types — no React, no DB, no Next imports.

export type Role = 'Admin' | 'Director' | 'Team' | 'Driver';

/** Hierarchy for invites and privilege checks: Admin > Director > Team > Driver. */
export const ROLE_RANK: Record<Role, number> = {
  Admin: 4,
  Director: 3,
  Team: 2,
  Driver: 1,
};

/** A membership as carried on the session (enriched in the `session` callback). */
export interface SessionMembership {
  id: string;
  role: Role;
  eventId: string | null;
  teamId: string | null;
  driverId: string | null;
}

/** The scope resolved for a single request from the URL args vs the session. */
export interface ResolvedScope {
  role: Role;
  eventId: string | null;
  teamId: string | null;
  driverId: string | null;
  /** True when access is granted via the platform-admin flag (cross-tenant). */
  isAdmin: boolean;
}

/** Minimal session shape the pure RBAC helpers reason about (testable w/o Auth.js). */
export interface PrincipalSession {
  user: {
    id: string;
    isPlatformAdmin: boolean;
    memberships: SessionMembership[];
  };
}
