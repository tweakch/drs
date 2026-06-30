// Typed, scoped data access (DRS-0003+). Every function goes through the lazy Neon
// client and filters by the caller's resolved scope in the query itself — never
// fetch-all-then-filter-in-JS. Parameterised via tagged templates (no string SQL).

import { sql } from '@/lib/db/client';
import type { Role, SessionMembership } from '@/lib/auth/types';
import {
  DEFAULT_VISIBILITY,
  type DriverProfile,
  type DriverVisibility,
} from '@/lib/entities/types';

// --- Row shapes ------------------------------------------------------------

export interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  isPlatformAdmin: boolean;
}

export interface MembershipDisplayRow {
  id: string;
  userId: string;
  userEmail: string | null;
  role: Role;
  eventId: string | null;
  eventName: string | null;
  teamId: string | null;
}

export interface EventRow {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string | null;
  date: string | null;
  status: string;
}

export interface InvitationRow {
  id: string;
  email: string;
  role: Role;
  eventId: string | null;
  teamId: string | null;
  status: string;
  invitedBy: string;
  expiresAt: Date;
}

export interface InviteDisplayRow {
  id: string;
  email: string;
  role: Role;
  eventId: string | null;
  eventName: string | null;
  teamId: string | null;
  status: string;
  invitedByEmail: string | null;
  expiresAt: string | null;
}

export interface RosterRow {
  membershipId: string;
  userId: string;
  email: string | null;
  name: string | null;
}

// --- Session enrichment (auth callbacks) -----------------------------------

export async function getUserMemberships(userId: string): Promise<SessionMembership[]> {
  const rows = await sql()`
    select id, event_id as "eventId", role, team_id as "teamId", driver_id as "driverId"
    from memberships where user_id = ${userId}
    order by created_at asc
  `;
  return rows as SessionMembership[];
}

export async function setUserPlatformAdmin(userId: string): Promise<void> {
  await sql()`update users set "isPlatformAdmin" = true where id = ${userId}`;
}

// --- Admin (cross-tenant) --------------------------------------------------

export async function listUsers(): Promise<UserRow[]> {
  const rows = await sql()`
    select id, email, name, "isPlatformAdmin"
    from users order by email asc
  `;
  return rows as UserRow[];
}

export async function listAllMemberships(): Promise<MembershipDisplayRow[]> {
  const rows = await sql()`
    select m.id, m.user_id as "userId", u.email as "userEmail", m.role,
           m.event_id as "eventId", e.name as "eventName", m.team_id as "teamId"
    from memberships m
    join users u on u.id = m.user_id
    left join events e on e.id = m.event_id
    order by u.email asc
  `;
  return rows as MembershipDisplayRow[];
}

export async function listAllEvents(): Promise<EventRow[]> {
  const rows = await sql()`
    select e.id, e.name, e.owner_id as "ownerId", u.email as "ownerEmail",
           e.date, e.status
    from events e
    join users u on u.id = e.owner_id
    order by e.created_at desc
  `;
  return rows as EventRow[];
}

export async function listPendingInvites(): Promise<InviteDisplayRow[]> {
  const rows = await sql()`
    select i.id, i.email, i.role, i.event_id as "eventId", e.name as "eventName",
           i.team_id as "teamId", i.status, u.email as "invitedByEmail",
           i.expires_at as "expiresAt"
    from invitations i
    join users u on u.id = i.invited_by
    left join events e on e.id = i.event_id
    where i.status = 'pending'
    order by i.created_at desc
  `;
  return rows as InviteDisplayRow[];
}

// --- Director (owner-scoped) ----------------------------------------------

export async function listEventsOwnedBy(ownerId: string): Promise<EventRow[]> {
  const rows = await sql()`
    select e.id, e.name, e.owner_id as "ownerId", u.email as "ownerEmail",
           e.date, e.status
    from events e
    join users u on u.id = e.owner_id
    where e.owner_id = ${ownerId}
    order by e.created_at desc
  `;
  return rows as EventRow[];
}

export async function getEventOwnedBy(eventId: string, ownerId: string): Promise<EventRow | null> {
  const rows = await sql()`
    select e.id, e.name, e.owner_id as "ownerId", u.email as "ownerEmail",
           e.date, e.status
    from events e
    join users u on u.id = e.owner_id
    where e.id = ${eventId} and e.owner_id = ${ownerId}
  `;
  return (rows[0] as EventRow | undefined) ?? null;
}

export async function createEvent(args: {
  name: string;
  ownerId: string;
  date?: string | null;
}): Promise<EventRow> {
  const rows = await sql()`
    insert into events (name, owner_id, date)
    values (${args.name}, ${args.ownerId}, ${args.date ?? null})
    returning id, name, owner_id as "ownerId", null as "ownerEmail", date, status
  `;
  return rows[0] as EventRow;
}

/** Status transition — scoped to the owner (no-op for non-owners). */
export async function setEventStatus(
  eventId: string,
  ownerId: string,
  status: string,
): Promise<void> {
  await sql()`
    update events set status = ${status}
    where id = ${eventId} and owner_id = ${ownerId}
  `;
}

// --- Team (team-scoped) ----------------------------------------------------

export async function listTeamRoster(teamId: string): Promise<RosterRow[]> {
  const rows = await sql()`
    select m.id as "membershipId", m.user_id as "userId", u.email, u.name
    from memberships m
    join users u on u.id = m.user_id
    where m.team_id = ${teamId} and m.role = 'Driver'
    order by u.name asc nulls last, u.email asc
  `;
  return rows as RosterRow[];
}

export async function listTeamPendingInvites(teamId: string): Promise<InviteDisplayRow[]> {
  const rows = await sql()`
    select i.id, i.email, i.role, i.event_id as "eventId", null as "eventName",
           i.team_id as "teamId", i.status, u.email as "invitedByEmail",
           i.expires_at as "expiresAt"
    from invitations i
    join users u on u.id = i.invited_by
    where i.team_id = ${teamId} and i.status = 'pending'
    order by i.created_at desc
  `;
  return rows as InviteDisplayRow[];
}

// --- Driver (self-scoped) --------------------------------------------------

export async function getUserById(userId: string): Promise<UserRow | null> {
  const rows = await sql()`
    select id, email, name, "isPlatformAdmin" from users where id = ${userId}
  `;
  return (rows[0] as UserRow | undefined) ?? null;
}

/** Update only the caller's own display name. */
export async function updateDisplayName(userId: string, name: string): Promise<void> {
  await sql()`update users set name = ${name} where id = ${userId}`;
}

/** The caller's self-chosen race identity (Named / Alias / Mystery + visibility). */
export async function getDriverProfile(userId: string): Promise<DriverProfile | null> {
  const rows = await sql()`
    select id, user_id as "userId", display_mode as "displayMode", full_name as "fullName",
           alias, abbreviation, number, nationality, avatar_url as "avatarUrl", socials, visibility
    from driver_profiles where user_id = ${userId}
  `;
  const r = rows[0] as
    (Omit<DriverProfile, 'visibility'> & { visibility: DriverVisibility | null }) | undefined;
  if (!r) return null;
  return {
    ...r,
    fullName: r.fullName ?? undefined,
    alias: r.alias ?? undefined,
    abbreviation: r.abbreviation ?? undefined,
    number: r.number ?? undefined,
    nationality: r.nationality ?? undefined,
    avatarUrl: r.avatarUrl ?? undefined,
    socials: r.socials ?? undefined,
    visibility: r.visibility ?? DEFAULT_VISIBILITY,
  };
}

/** Upsert the caller's own identity (one profile per user). */
export async function upsertDriverProfile(userId: string, p: DriverProfile): Promise<void> {
  await sql()`
    insert into driver_profiles
      (user_id, display_mode, full_name, alias, abbreviation, number, nationality, avatar_url, socials, visibility)
    values
      (${userId}, ${p.displayMode}, ${p.fullName ?? null}, ${p.alias ?? null}, ${p.abbreviation ?? null},
       ${p.number ?? null}, ${p.nationality ?? null}, ${p.avatarUrl ?? null},
       ${JSON.stringify(p.socials ?? null)}::jsonb, ${JSON.stringify(p.visibility)}::jsonb)
    on conflict (user_id) do update set
      display_mode = excluded.display_mode, full_name = excluded.full_name, alias = excluded.alias,
      abbreviation = excluded.abbreviation, number = excluded.number, nationality = excluded.nationality,
      avatar_url = excluded.avatar_url, socials = excluded.socials, visibility = excluded.visibility
  `;
}

// --- Invitations -----------------------------------------------------------

export async function insertInvitation(args: {
  email: string;
  role: Role;
  eventId: string | null;
  teamId: string | null;
  tokenHash: string;
  invitedBy: string;
  expiresAt: Date;
}): Promise<{ id: string }> {
  const rows = await sql()`
    insert into invitations (email, role, event_id, team_id, token_hash, invited_by, expires_at)
    values (${args.email}, ${args.role}, ${args.eventId}, ${args.teamId},
            ${args.tokenHash}, ${args.invitedBy}, ${args.expiresAt.toISOString()})
    returning id
  `;
  return rows[0] as { id: string };
}

export async function findInvitationByHash(tokenHash: string): Promise<InvitationRow | null> {
  const rows = await sql()`
    select id, email, role, event_id as "eventId", team_id as "teamId",
           status, invited_by as "invitedBy", expires_at as "expiresAt"
    from invitations where token_hash = ${tokenHash}
  `;
  const row = rows[0] as (Omit<InvitationRow, 'expiresAt'> & { expiresAt: string }) | undefined;
  if (!row) return null;
  return { ...row, expiresAt: new Date(row.expiresAt) };
}

export async function markInvitationAccepted(id: string): Promise<void> {
  await sql()`update invitations set status = 'accepted' where id = ${id}`;
}

export async function createMembership(args: {
  userId: string;
  eventId: string | null;
  role: Role;
  teamId: string | null;
  driverId: string | null;
}): Promise<void> {
  await sql()`
    insert into memberships (user_id, event_id, role, team_id, driver_id)
    values (${args.userId}, ${args.eventId}, ${args.role}, ${args.teamId}, ${args.driverId})
  `;
}

// --- Seeded sample races (DRS-0009 F1 ingestion) ---------------------------

export interface SeededRaceRow {
  id: string;
  name: string;
  trackName: string;
  trackLengthM: number;
  date: string | null;
  season: number | null;
  round: number | null;
  carCount: number;
  lapCount: number;
}

/**
 * Latest ownerless, seeded sample race. Filtered to rows carrying a `source_ref`
 * (DRS-0009 F1 seeds) so it only ever returns public sample data — never an
 * event-scoped (tenant) race. This is the DB-backed read seam the landing/replay
 * path consumes once wired off the embedded sample.
 */
export async function getLatestSeededRace(): Promise<SeededRaceRow | null> {
  const rows = await sql()`
    select r.id, r.name, r.track_name as "trackName", r.track_length_m as "trackLengthM",
           r.date, r.season, r.round,
           count(distinct t.id)::int as "carCount",
           count(l.id)::int as "lapCount"
    from races r
    left join teams t on t.race_id = r.id
    left join laps l on l.team_id = t.id
    where r.source_ref is not null
    group by r.id
    order by r.date desc nulls last, r.created_at desc
    limit 1
  `;
  return (rows[0] as SeededRaceRow | undefined) ?? null;
}
