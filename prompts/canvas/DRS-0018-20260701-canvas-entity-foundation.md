---
id: DRS-0018
slice: entity-foundation
type: canvas
status: draft
created: 2026-07-01
updated: 2026-07-01
source_story: (build-out goal — world-layer entities, FastF1-informed)
---

# REASONS Canvas — DRS-0018 · Entity foundation

> The world layer: first-class Tracks, Teams, Drivers and the season Calendar, with
> driver-controlled identity. Data model mirrors FastF1 (SessionResults/CircuitInfo).

## R — Requirements

**Problem.** The app only models one race. Tracks, the calendar, teams and drivers
have no first-class home, and drivers can't choose how they appear.

**In scope.** Canonical entity types · the **driver identity resolver** (Named /
Alias / Mystery + per-field visibility) · the Swiss-karting registry seed (TRACKS.md

- EVENTS.md) · additive, idempotent DB schema for tracks (extended), team_profiles,
  driver_profiles, calendar_events.

**Out of scope (next slices).** The hub pages (Circuits/Calendar/Teams/Drivers UI);
seed-SQL generation + apply; wiring the resolver into the live views; telemetry import.

**Definition of done.** Types compile; identity resolver masks correctly per mode and
per field (unit-tested); registry holds the real tracks/events (unit-tested); schema
is additive + idempotent. Gates green.

## E — Entities

- `lib/entities/types.ts` — Track, TeamProfile, DriverProfile + DriverIdentity, CalendarEvent.
- `lib/entities/identity.ts` — `publicDriver()`, `displayName()`, `shows*()`.
- `lib/entities/registry.ts` — `TRACKS`, `EVENTS` (typed, real), helpers.
- `lib/db/schema.sql` — additive: tracks columns; team_profiles; driver_profiles; calendar_events.

## A — Assumptions

- Mirrors FastF1: SessionResults → driver/team fields (Abbreviation, TeamColor,
  CountryCode); CircuitInfo → track shape/corners. Team-colour convention (drivers
  share the team colour).
- Registry is a DB-free read seam now (like getLatestRace); the same data seeds the DB.
- Mystery withholds all identifying fields (name → codename, no nationality/socials,
  silhouette avatar); the kart number stays visible so the timing tower still works.

## S — Sequence

1. Types → identity resolver → registry → schema.
2. Resolver: `displayName` per mode; `publicDriver` strips fields by mode + visibility.

## N — Non-functionals

- Resolver + registry pure and DOM-free. Schema additive + idempotent (DRS-0009 style).

## S — Surface

- Unit: identity masking (per mode + per field, kart number retained); registry shape
  (unique slugs, 3 ASS circuits, Wohlen traced, R3 the only round with data).
