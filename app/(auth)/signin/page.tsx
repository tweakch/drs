import { signIn } from '@/auth';

export const dynamic = 'force-dynamic';

// Magic-link sign-in: email → signIn('resend'). Invite-only; an unknown email
// simply never receives a usable session without a matching membership.
export default function SignInPage() {
  return (
    <div className="mx-auto max-w-[420px] px-6 py-20">
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
  );
}
