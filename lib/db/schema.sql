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
