// Edge-safe Auth.js config (DRS-0003). Shared by middleware and the full server
// config. NO adapter, NO node-only imports here — middleware must stay DB-free so
// `next build` and the Edge runtime stay green.
import type { NextAuthConfig } from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { resolveEmailFrom } from '@/lib/auth/email-from';

export default {
  // The Resend provider is an *email* provider, which Auth.js requires to be
  // paired with an adapter. The adapter is Node-only and lives in auth.ts, so we
  // must NOT initialise the provider in the Edge middleware runtime — doing so
  // throws `MissingAdapter` on every middleware invocation. Middleware only needs
  // the session cookie + `authorized` callback to gate routes, not the provider.
  providers:
    process.env.NEXT_RUNTIME === 'nodejs'
      ? [
          Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            // Free-mail domains can't be Resend-verified and 403 on send; fall back
            // to the onboarding sender so sign-in works. See lib/auth/email-from.ts.
            from: resolveEmailFrom(process.env.AUTH_EMAIL_FROM),
          }),
        ]
      : [],
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-request',
  },
  callbacks: {
    // Coarse middleware gate: authenticated users only. Per-resource role/scope
    // checks live in lib/auth + the (app) layout (the real DB-backed gate).
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
