import { describe, expect, it } from 'vitest';
import { isAdmin, hasRole, can } from './rbac';
import { resolveScope } from './scope';
import type { PrincipalSession, SessionMembership } from './types';

function membership(over: Partial<SessionMembership>): SessionMembership {
  return { id: 'm', role: 'Driver', eventId: null, teamId: null, driverId: null, ...over };
}

function session(over: Partial<PrincipalSession['user']>): PrincipalSession {
  return { user: { id: 'u1', isPlatformAdmin: false, memberships: [], ...over } };
}

const director = session({
  memberships: [membership({ id: 'm1', role: 'Director', eventId: 'e1' })],
});
const team = session({
  memberships: [membership({ id: 'm2', role: 'Team', eventId: 'e1', teamId: 't1' })],
});
const driver = session({
  memberships: [membership({ id: 'm3', role: 'Driver', eventId: 'e1', teamId: 't1' })],
});
const admin = session({ isPlatformAdmin: true });

describe('isAdmin', () => {
  it('is true only for the platform-admin flag', () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(director)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe('hasRole', () => {
  it('matches a held membership role', () => {
    expect(hasRole(director, 'Director')).toBe(true);
    expect(hasRole(team, 'Team')).toBe(true);
    expect(hasRole(driver, 'Driver')).toBe(true);
  });

  it('denies a role the caller does not hold (deny by default)', () => {
    expect(hasRole(driver, 'Director')).toBe(false);
    expect(hasRole(team, 'Director')).toBe(false);
    expect(hasRole(null, 'Driver')).toBe(false);
  });

  it('admin satisfies any role, but only admin satisfies Admin', () => {
    expect(hasRole(admin, 'Director')).toBe(true);
    expect(hasRole(admin, 'Admin')).toBe(true);
    expect(hasRole(director, 'Admin')).toBe(false);
  });
});

describe('resolveScope', () => {
  it('grants when a membership matches the requested event', () => {
    const scope = resolveScope(director, { eventId: 'e1' });
    expect(scope?.role).toBe('Director');
    expect(scope?.isAdmin).toBe(false);
  });

  it('denies cross-tenant access (no matching membership → null)', () => {
    expect(resolveScope(director, { eventId: 'other' })).toBeNull();
    expect(resolveScope(team, { teamId: 'other' })).toBeNull();
  });

  it('admin resolves cross-tenant for any scope', () => {
    const scope = resolveScope(admin, { eventId: 'anything' });
    expect(scope?.isAdmin).toBe(true);
    expect(scope?.role).toBe('Admin');
  });

  it('returns null for an unauthenticated caller', () => {
    expect(resolveScope(null, { eventId: 'e1' })).toBeNull();
  });
});

describe('can', () => {
  it('admin can do anything', () => {
    expect(can(admin, 'manage', { type: 'event', eventId: 'e1' })).toBe(true);
    expect(can(admin, 'invite', { type: 'platform' })).toBe(true);
  });

  it('a Director can manage their own event but not someone else’s', () => {
    expect(can(director, 'manage', { type: 'event', eventId: 'e1' })).toBe(true);
    expect(can(director, 'manage', { type: 'event', eventId: 'e2' })).toBe(false);
  });

  it('a Driver cannot invite into an event', () => {
    expect(can(driver, 'invite', { type: 'event', eventId: 'e1' })).toBe(false);
    expect(can(driver, 'view', { type: 'event', eventId: 'e1' })).toBe(true);
  });

  it('only admin reaches platform resources', () => {
    expect(can(director, 'manage', { type: 'platform' })).toBe(false);
  });
});
