import { signIn } from '@/auth';
import { LandingReplay } from '@/components/replay/LandingReplay';
import { getLatestRace } from '@/lib/race/latest';

export const dynamic = 'force-dynamic';

// Magic-link sign-in: email → signIn('resend'). Invite-only; an unknown email
// simply never receives a usable session without a matching membership.
//
// The looping race replay (same component + DB-free sample race as the public
// landing page) sits alongside the form so the sign-in screen stays on-brand.
export default function SignInPage() {
  const race = getLatestRace();
  return (
    <main className="mx-auto grid min-h-screen max-w-[1100px] items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:py-24">
      <div className="order-2 lg:order-1">
        <LandingReplay race={race} />
        <p className="mt-3 text-center text-xs text-dim">Replay — {race.name}</p>
      </div>

      <div className="order-1 mx-auto w-full max-w-[420px] lg:order-2">
        <div className="mb-8 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-hot">DRS</div>
          <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-paint">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-dim">We email you a one-time magic link.</p>
        </div>
        <form
          action={async (formData: FormData) => {
            'use server';
            await signIn('resend', formData);
          }}
          className="flex flex-col gap-3"
        >
          <label
            htmlFor="email"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-md border border-line bg-asphalt-2 px-3 py-2 text-paint outline-none focus:border-cool"
          />
          <button
            type="submit"
            className="mt-2 rounded-md border border-hot bg-hot/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20"
          >
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}
