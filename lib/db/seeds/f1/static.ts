// Static reference data for the F1 seed pipeline. Pure constants — no I/O.
//
// Jolpica/Ergast does not expose circuit geometry or team colours, so we supply
// them here: a small known-circuit length table, the constructor palette, and the
// Wohlen SVG track path reused as a stand-in `layout` so the Replay view animates
// for F1 races too (scope decision — see the DRS-0009 story/canvas).

/** Circuit length in metres, keyed by Ergast `circuitId`. Fallback handled by caller. */
export const CIRCUIT_LENGTHS_M: Record<string, number> = {
  red_bull_ring: 4318,
  silverstone: 5891,
  monza: 5793,
  spa: 7004,
  hungaroring: 4381,
  catalunya: 4657,
  monaco: 3337,
  villeneuve: 4361,
  bahrain: 5412,
  jeddah: 6174,
  albert_park: 5278,
  suzuka: 5807,
  miami: 5412,
  imola: 4909,
  americas: 5513,
  rodriguez: 4304,
  interlagos: 4309,
  vegas: 6201,
  losail: 5419,
  yas_marina: 5281,
  marina_bay: 4940,
  zandvoort: 4259,
  baku: 6003,
  shanghai: 5451,
};

/** Default circuit length (m) when the circuit isn't in the table above. */
export const DEFAULT_CIRCUIT_LENGTH_M = 5000;

/** Constructor livery colour, keyed by Ergast `constructorId`. */
export const CONSTRUCTOR_COLORS: Record<string, string> = {
  mercedes: '#27F4D2',
  red_bull: '#3671C6',
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#0093CC',
  williams: '#64C4FF',
  rb: '#6692FF',
  racing_bulls: '#6692FF',
  sauber: '#52E252',
  audi: '#00505C',
  haas: '#B6BABD',
  cadillac: '#B0985F',
};

/** Palette used to colour any constructor missing from {@link CONSTRUCTOR_COLORS}. */
export const FALLBACK_COLORS = ['#9AA0A6', '#C77DFF', '#FFB703', '#06D6A0', '#EF476F'];

// The Kartbahn Wohlen layout — mirrors lib/race/sample-race.ts TRACK_PATH. Copied
// (not imported) to keep the seed subsystem self-contained for the Node script
// runtime. Reused verbatim as the stand-in replay path for every F1 circuit.
export const WOHLEN_TRACK_PATH =
  'M 341.9 209.1 Q 342 205.3 343.1 135.6 Q 344.3 65.9 345.7 63.0 Q 347.1 60 351.0 57.5 Q 354.9 54.9 359.9 54.5 Q 365 54 368.7 55.9 Q 372.4 57.7 375.6 60.5 Q 378.8 63.2 398.8 88.3 Q 418.8 113.3 420.9 119.5 Q 423 125.7 421.6 128.7 Q 420.2 131.7 417.2 134.4 Q 414.2 137.2 409.6 138.1 Q 405 139.1 394.2 140.4 Q 383.4 141.8 378.4 145.0 Q 373.3 148.2 370.8 152.3 Q 368.3 156.5 368.3 161.3 Q 368.3 166.2 370.1 170.3 Q 371.9 174.4 377.2 177.4 Q 382.5 180.4 390.6 182.0 Q 398.6 183.6 431.3 184.6 Q 463.9 185.5 471.3 187.6 Q 478.6 189.6 485.7 193.8 Q 492.8 197.9 496.5 202.8 Q 500.2 207.6 526.6 241.6 Q 553.1 275.6 555.6 281.8 Q 558.1 288 557.4 295.8 Q 556.7 303.6 552.6 309.6 Q 548.5 315.6 542.5 317.0 Q 536.5 318.3 530.3 317.2 Q 524.1 316.1 520.2 313.6 Q 516.3 311 501.8 295.1 Q 487.3 279.3 485.5 273.8 Q 483.7 268.2 478.6 247.6 Q 473.5 226.9 470.8 223.8 Q 468 220.7 463.8 218.3 Q 459.6 215.8 455.4 216.3 Q 451.1 216.8 447.5 219.1 Q 443.9 221.3 441.5 226.2 Q 439.1 231.1 439.8 236.6 Q 440.4 242.1 464.4 291.2 Q 488.5 340.3 489.4 344.4 Q 490.4 348.4 490.3 352.8 Q 490.1 357.2 488.1 360.1 Q 486.2 363.1 482.4 364.6 Q 478.7 366 475.8 365.5 Q 472.9 365 454.4 360.8 Q 435.8 356.6 433.7 355.0 Q 431.6 353.3 430.0 349.8 Q 428.4 346.2 428.2 342.3 Q 428 338.4 433.9 318.9 Q 439.7 299.3 439.5 294.8 Q 439.4 290.3 438.4 286.7 Q 437.5 283.1 436.1 278.9 Q 434.8 274.6 421.8 244.6 Q 408.8 214.5 405.9 211.9 Q 403 209.3 399.3 209.0 Q 395.5 208.7 391.3 209.1 Q 387.1 209.6 384.3 212.8 Q 381.5 216.1 379.6 220.6 Q 377.6 225.2 377.8 229.9 Q 378 234.7 379.3 237.4 Q 380.6 240.2 396.4 261.0 Q 412.1 281.8 412.8 285.6 Q 413.4 289.3 413.0 295.0 Q 412.7 300.7 409.1 303.6 Q 405.6 306.5 401.7 306.6 Q 397.8 306.8 392.5 304.6 Q 387.1 302.3 383.6 299.2 Q 380.2 296.1 362.0 259.2 Q 343.8 222.3 342.9 217.6 Q 341.9 212.9 341.9 209.1 Z';

/** The stand-in track layout stored as `tracks.layout` for every seeded F1 circuit. */
export const WOHLEN_STANDIN_LAYOUT = {
  path: WOHLEN_TRACK_PATH,
  source: 'wohlen-standin',
} as const;
