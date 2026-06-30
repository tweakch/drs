// Invitations (DRS-0003). Server-issued, single-use, expiring; the raw token is
// returned once and only its SHA-256 hash is stored. The issuer must out-rank the
// granted role. Pure helpers (hashToken / canInvite / isAcceptable) are unit-tested
// without a DB; the create/accept functions wrap them with scoped queries.

import { createHash, randomBytes } from 'node:crypto';
import {
  insertInvitation,
  findInvitationByHash,
  markInvitationAccepted,
  createMembership,
  type InvitationRow,
} from '@/lib/db/queries';
import { ROLE_RANK, type Role } from './types';

/** 7-day invitation lifetime. */
export const INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

/** Deterministic SHA-256 hex hash of a raw token (pure). */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Hierarchy rule: an issuer may only grant a strictly lower role. */
export function canInvite(issuerRole: Role, grantedRole: Role): boolean {
  return ROLE_RANK[issuerRole] > ROLE_RANK[grantedRole];
}

/** A pending, unexpired invitation can be accepted (pure). */
export function isAcceptable(
  invitation: Pick<InvitationRow, 'status' | 'expiresAt'>,
  now: Date = new Date(),
): boolean {
  return invitation.status === 'pending' && invitation.expiresAt.getTime() > now.getTime();
}

export interface CreateInvitationArgs {
  email: string;
  role: Role;
  /** The resolved role of the issuer (server-derived) — enforces out-ranking. */
  invitedByRole: Role;
  invitedBy: string;
  eventId?: string | null;
  teamId?: string | null;
}

export interface CreatedInvitation {
  id: string;
  /** The raw token — surfaced once for the invite link; never stored. */
  rawToken: string;
  expiresAt: Date;
}

/**
 * Create an invitation. Throws if the issuer does not out-rank the granted role.
 * Stores only the token hash; returns the raw token for the one-time link.
 */
export async function createInvitation(args: CreateInvitationArgs): Promise<CreatedInvitation> {
  if (!canInvite(args.invitedByRole, args.role)) {
    throw new Error(`A ${args.invitedByRole} may not invite a ${args.role}.`);
  }
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

  const row = await insertInvitation({
    email: args.email.trim().toLowerCase(),
    role: args.role,
    eventId: args.eventId ?? null,
    teamId: args.teamId ?? null,
    tokenHash,
    invitedBy: args.invitedBy,
    expiresAt,
  });

  return { id: row.id, rawToken, expiresAt };
}

export interface AcceptResult {
  ok: boolean;
  role?: Role;
  reason?: 'not_found' | 'expired_or_used';
}

/**
 * Accept an invitation by raw token for `userId`: verify the hash, ensure it is
 * pending + unexpired, mark it accepted, and create the Membership.
 */
export async function acceptInvitation(rawToken: string, userId: string): Promise<AcceptResult> {
  const tokenHash = hashToken(rawToken);
  const invitation = await findInvitationByHash(tokenHash);
  if (!invitation) return { ok: false, reason: 'not_found' };
  if (!isAcceptable(invitation)) return { ok: false, reason: 'expired_or_used' };

  await markInvitationAccepted(invitation.id);
  await createMembership({
    userId,
    eventId: invitation.eventId,
    role: invitation.role,
    teamId: invitation.teamId,
    driverId: null,
  });

  return { ok: true, role: invitation.role };
}
