// Pure time formatters, ported verbatim from the prototype. No DOM, no framework.

/** Lap time as `m:ss.mmm` (or `ss.mmm` under a minute); `—` for null/NaN. */
export const FMT = (t: number | null): string => {
  if (t == null || isNaN(t)) return '—';
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, '0')}` : s.toFixed(3);
};

/** Stint duration as `m:ss min` (no decimals). */
export const fmtDuration = (t: number | null): string => {
  if (t == null || isNaN(t)) return '—';
  const m = Math.floor(t / 60);
  const s = Math.round(t - m * 60);
  const mm = s === 60 ? m + 1 : m;
  const ss = s === 60 ? 0 : s;
  return `${mm}:${String(ss).padStart(2, '0')} min`;
};
