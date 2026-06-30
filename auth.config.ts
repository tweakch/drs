// Edge-safe Auth.js config (DRS-0003). Shared by middleware and the full server
// config. NO adapter, NO node-only imports here — middleware must stay DB-free so
// `next build` and the Edge runtime stay green.
import type { NextAuthConfig } from 'next-auth';
import Resend from 'next-auth/providers/resend';

export default {
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? 'onboarding@resend.dev',
    }),
  ],
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
