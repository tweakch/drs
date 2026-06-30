// Track facts for the case header. Sourced from TRACKS.md; a stepping stone to the
// first-class Track DB row that the Circuits hub will introduce.

export interface TrackMeta {
  name: string;
  canton: string;
  cantonCode: string;
  lengthM: number;
  turns: number;
  opened: number;
  /** Homologation note, e.g. ASS competition circuit. */
  homolog: string;
}

export const WOHLEN: TrackMeta = {
  name: 'Kartbahn Wohlen',
  canton: 'Aargau',
  cantonCode: 'AG',
  lengthM: 825,
  turns: 11,
  opened: 1962, // Switzerland's first permanent kart track
  homolog: 'ASS competition circuit',
};
