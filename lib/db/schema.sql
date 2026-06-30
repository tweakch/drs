-- DRS persistence core (DRS-0002).
-- The canonical race is immutable once ingested; stints are derived (not stored),
-- and driver/kart tags are persisted in a later slice.

create table if not exists races (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  track_name     text not null,
  track_length_m integer not null,
  date           date not null,
  format         text not null default 'endurance',
  duration_s     integer not null,
  is_virtual     boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists teams (
  id      uuid primary key default gen_random_uuid(),
  race_id uuid not null references races (id) on delete cascade,
  name    text not null,
  color   text not null
);

create table if not exists laps (
  id      bigint generated always as identity primary key,
  team_id uuid not null references teams (id) on delete cascade,
  idx     integer not null,
  time_s  double precision not null
);

create index if not exists laps_team_idx on laps (team_id, idx);

-- ---------------------------------------------------------------------------
-- Identity & access (DRS-0003). Auth.js pg-adapter tables + DRS domain tables.
-- Roles: Admin | Director | Team | Driver. Access is invite-only, event-scoped.
-- ---------------------------------------------------------------------------

-- Auth.js (@auth/pg-adapter) tables. Names/columns match what the adapter queries
-- (users, accounts, sessions, verification_token). ids are uuid (gen_random_uuid).
create table if not exists users (
  id                uuid primary key default gen_random_uuid(),
  name              text,
  email             text unique,
  "emailVerified"   timestamptz,
  image             text,
  "isPlatformAdmin" boolean not null default false,
  "createdAt"       timestamptz not null default now()
);

create table if not exists accounts (
  id                  uuid primary key default gen_random_uuid(),
  "userId"            uuid not null references users (id) on delete cascade,
  type                text not null,
  provider            text not null,
  "providerAccountId" text not null,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  unique (provider, "providerAccountId")
);

create table if not exists sessions (
  id             uuid primary key default gen_random_uuid(),
  "userId"       uuid not null references users (id) on delete cascade,
  expires        timestamptz not null,
  "sessionToken" text not null unique
);

create table if not exists verification_token (
  identifier text not null,
  expires    timestamptz not null,
  token      text not null,
  primary key (identifier, token)
);

-- Event = the tenant boundary; one owner (Director) per event for now.
create table if not exists events (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references users (id) on delete cascade,
  date       date,
  status     text not null default 'draft',
  created_at timestamptz not null default now()
);

-- Membership = who can do what, where. One row per (user x event x role).
-- team_id / driver_id are bare uuids (the domain team/driver land with race ingest).
create table if not exists memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  event_id   uuid references events (id) on delete cascade,
  role       text not null,
  team_id    uuid,
  driver_id  uuid,
  created_at timestamptz not null default now()
);

create index if not exists memberships_user_idx on memberships (user_id);
create index if not exists memberships_event_idx on memberships (event_id);
create index if not exists memberships_team_idx on memberships (team_id);

-- Invitation = the only way in. Token is single-use, expiring, hashed at rest.
-- invited_by + created_at form the access-control audit trail.
create table if not exists invitations (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  event_id   uuid references events (id) on delete cascade,
  role       text not null,
  team_id    uuid,
  token_hash text not null unique,
  invited_by uuid not null references users (id),
  status     text not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists invitations_status_idx on invitations (status);

-- ---------------------------------------------------------------------------
-- F1 ingestion seeds (DRS-0009). First-class tracks / constructors / drivers so
-- real F1 races (fetched from Jolpica/Ergast) can seed the prod DB as realistic
-- sample data. All ADDITIVE and idempotent: `pnpm migrate` is a no-op on re-run
-- and existing kart-domain tables/rows are untouched. F1 cars map onto the
-- race->team->lap model: one `race` per Grand Prix, one `team` row per car (the
-- lap-sequence owner) tagged with its driver + constructor.
-- ---------------------------------------------------------------------------

-- A circuit. `ref` is the Ergast circuitId (natural key for idempotent upserts).
-- `layout` holds the SVG replay path; F1 circuits reuse the Wohlen layout as a
-- stand-in (Jolpica has no geometry) so the Replay view still animates.
create table if not exists tracks (
  id        uuid primary key default gen_random_uuid(),
  ref       text unique,
  name      text not null,
  length_m  integer,
  country   text,
  locality  text,
  layout    jsonb
);

-- An F1 constructor (the sport's "team"). `ref` = Ergast constructorId.
create table if not exists constructors (
  id          uuid primary key default gen_random_uuid(),
  ref         text unique,
  name        text not null,
  nationality text
);

-- An F1 driver catalogue entry. `ref` = Ergast driverId.
create table if not exists drivers (
  id               uuid primary key default gen_random_uuid(),
  ref              text unique,
  code             text,
  given_name       text,
  family_name      text,
  nationality      text,
  permanent_number integer
);

-- Additive columns linking the existing race domain to the new entities and
-- carrying the natural keys that make seeding idempotent.
alter table races add column if not exists track_id   uuid references tracks (id);
alter table races add column if not exists season     integer;
alter table races add column if not exists round      integer;
alter table races add column if not exists source_ref text;

alter table teams add column if not exists driver_id      uuid references drivers (id);
alter table teams add column if not exists constructor_id uuid references constructors (id);
alter table teams add column if not exists source_ref     text;

-- Natural-key uniqueness for `on conflict` upserts (partial: only seeded rows
-- carry a source_ref, so hand-entered kart races are unaffected).
create unique index if not exists races_source_ref_uq on races (source_ref) where source_ref is not null;
create unique index if not exists teams_source_ref_uq on teams (source_ref) where source_ref is not null;
-- Laps upsert on (team_id, idx); complements the existing non-unique lookup index.
create unique index if not exists laps_team_idx_uq on laps (team_id, idx);
