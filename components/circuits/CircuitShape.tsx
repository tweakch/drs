import type { Track } from '@/lib/entities/types';

// The circuit-shape token — the atlas's recurring signature. A traced track renders
// its real silhouette in confident ink; an untraced one renders a faint ghost loop,
// which doubles as the invitation to trace it.

// viewBox framing the Wohlen TRACK_PATH bounds (x≈342..557, y≈54..366).
const TRACED_VIEWBOX = '320 40 270 340';

// A generic stylised loop for untraced circuits — "a track, shape unknown".
const GHOST =
  'M28 60 C20 36 40 22 56 26 C72 30 70 14 84 24 C98 34 86 52 74 56 C84 70 70 86 54 80 C40 75 44 66 38 70 C26 78 18 72 22 64 C24 60 26 62 28 60 Z';

export function CircuitShape({ track, className = '' }: { track: Track; className?: string }) {
  if (track.shape === 'traced' && track.layout) {
    return (
      <svg
        viewBox={TRACED_VIEWBOX}
        role="img"
        aria-label={`${track.name} outline`}
        className={className}
      >
        <path
          d={track.layout}
          fill="none"
          className="stroke-sbest"
          strokeOpacity={0.9}
          strokeWidth={10}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="10 10 90 80"
      role="img"
      aria-label={`${track.name} — shape not traced`}
      className={className}
    >
      <path
        d={GHOST}
        fill="none"
        className="stroke-dim"
        strokeOpacity={0.5}
        strokeWidth={2}
        strokeDasharray="3 4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
