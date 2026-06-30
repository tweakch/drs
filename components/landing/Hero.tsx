import Link from 'next/link';

export function Hero() {
  return (
    <div className="max-w-2xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-hot">
        Kartbahn Wohlen · 2H GP · Turbo Kart
      </div>
      <h1 className="mt-3 text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-paint">
        Read the race,
        <br />
        lap by lap.
      </h1>
      <p className="mt-4 text-base text-muted">
        DRS turns raw endurance-kart lap times into an After-Action Review — stints, pace,
        degradation and the story of the race. Below, the latest race replays itself, kart by kart.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          href="/signin"
          className="rounded-md border border-hot bg-hot/10 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20"
        >
          Sign in
        </Link>
        <Link
          href="/data"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:border-cool"
        >
          Enter app
        </Link>
      </div>
    </div>
  );
}
