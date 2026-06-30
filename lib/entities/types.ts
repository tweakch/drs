// Canonical entity model for the world layer (Tracks, Teams, Drivers, Events).
// Field choices mirror FastF1's data model (SessionResults / CircuitInfo) so the
// schema is proven for this domain. Pure types; no DB or React here.

// ---- Track ----------------------------------------------------------------
export type TrackType = 'indoor' | 'outdoor' | 'both';
export type ShapeStatus = 'traced' | 'external' | 'none';

export interface Track {
  slug: string;
  name: string;
  canton: string;
  cantonCode: string;
  type: TrackType;
  /** Official length in metres, when known. */
  lengthM?: number;
  turns?: number;
  /** Petrol | electric | both, free-text as sourced. */
  karts?: string;
  /** Homologated by Auto Sport Schweiz for competition. */
  assHomologated: boolean;
  opened?: number;
  status: 'operating' | 'construction' | 'closed';
  website?: string;
  /** Whether we hold a traced SVG, an external map, or nothing yet. */
  shape: ShapeStatus;
  /** SVG path `d` for the replay/atlas silhouette, when traced. */
  layout?: string;
  /** viewBox framing `layout` (each traced track has its own coordinate space). */
  layoutViewBox?: string;
}

// ---- Team -----------------------------------------------------------------
export interface TeamProfile {
  slug: string;
  name: string;
  /** Brand colour — the FastF1 convention: drivers on a team share it. */
  color: string;
  website?: string;
  socials?: Socials;
  homeTrackSlug?: string;
  logoUrl?: string;
}

// ---- Driver (identity-controlled) -----------------------------------------
export type DisplayMode = 'named' | 'alias' | 'mystery';

export interface Socials {
  instagram?: string;
  x?: string;
  website?: string;
}

/** Per-field visibility, applied within `named` / `alias` modes. */
export interface DriverVisibility {
  nationality: boolean;
  socials: boolean;
  /** Show their kart/seat history across races. */
  kartHistory: boolean;
  /** Show which team(s) they drive for. */
  team: boolean;
}

export const DEFAULT_VISIBILITY: DriverVisibility = {
  nationality: true,
  socials: true,
  kartHistory: true,
  team: true,
};

/** The stored driver record — may contain identity the driver keeps private. */
export interface DriverProfile {
  id: string;
  /** Links to the auth user (the human), when claimed. */
  userId?: string;
  displayMode: DisplayMode;
  fullName?: string;
  alias?: string;
  /** 3-letter code (FastF1 Abbreviation convention). */
  abbreviation?: string;
  number?: number;
  /** ISO country code, e.g. "CH". */
  nationality?: string;
  avatarUrl?: string;
  socials?: Socials;
  visibility: DriverVisibility;
}

/** Only what is safe to render publicly — the resolver's output. */
export interface PublicDriver {
  id: string;
  name: string;
  mode: DisplayMode;
  abbreviation?: string;
  number?: number;
  nationality?: string;
  /** Null when masked — the UI shows a silhouette. */
  avatarUrl: string | null;
  socials?: Socials;
  /** True for a mystery driver (identity withheld). */
  masked: boolean;
}

// ---- Event / Race (the dataset) -------------------------------------------
export type EntryType = 'open' | 'licensed';

export interface CalendarEvent {
  slug: string;
  name: string;
  trackSlug: string;
  /** ISO date, e.g. "2026-06-28". */
  date: string;
  format: string;
  entry: EntryType;
  spectatorOpen?: boolean;
  /** True once a timing dataset has been ingested for this round. */
  hasData: boolean;
}
