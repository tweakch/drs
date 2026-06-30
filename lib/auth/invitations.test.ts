import { describe, expect, it } from 'vitest';
import { hashToken, canInvite, isAcceptable, INVITATION_TTL_MS } from './invitations';

describe('hashToken', () => {
  it('is deterministic for the same input', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });

  it('differs for different inputs and never returns the raw token', () => {
    const raw = 'super-secret-token';
    const hash = hashToken(raw);
    expect(hash).not.toBe(raw);
    expect(hash).not.toBe(hashToken('other'));
    expect(hash).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex
  });
});

describe('canInvite (issuer must out-rank the granted role)', () => {
  it('allows granting a strictly lower role', () => {
    expect(canInvite('Admin', 'Director')).toBe(true);
    expect(canInvite('Director', 'Team')).toBe(true);
    expect(canInvite('Team', 'Driver')).toBe(true);
  });

  it('forbids granting an equal or higher role', () => {
    expect(canInvite('Director', 'Director')).toBe(false);
    expect(canInvite('Team', 'Director')).toBe(false);
    expect(canInvite('Driver', 'Team')).toBe(false);
    expect(canInvite('Driver', 'Driver')).toBe(false);
  });
});

describe('isAcceptable', () => {
  const future = new Date(Date.now() + INVITATION_TTL_MS);
  const past = new Date(Date.now() - 1000);

  it('accepts a pending, unexpired invitation', () => {
    expect(isAcceptable({ status: 'pending', expiresAt: future })).toBe(true);
  });

  it('rejects an expired invitation', () => {
    expect(isAcceptable({ status: 'pending', expiresAt: past })).toBe(false);
  });

  it('rejects an already-used (accepted/revoked) invitation', () => {
    expect(isAcceptable({ status: 'accepted', expiresAt: future })).toBe(false);
    expect(isAcceptable({ status: 'revoked', expiresAt: future })).toBe(false);
  });
});
