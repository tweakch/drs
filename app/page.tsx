import { Hero } from '@/components/landing/Hero';
import { LandingReplay } from '@/components/replay/LandingReplay';
import { getLatestRace } from '@/lib/race/latest';

// Public landing page. Root layout only — no auth()/DB, so it stays static and
// builds + serves with no secrets. The (app) group keeps gating the real views.
export default function LandingPage() {
  const race = getLatestRace();
  return (
    <main className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
      <Hero />
      <LandingReplay race={race} />
    </main>
  );
}
