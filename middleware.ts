// Coarse, DB-free route gate (DRS-0003). Uses the edge-safe config only; the real
// DB-backed authorization happens in the (app) layout and lib/auth. Unauthenticated
// requests to protected routes are redirected to /signin (via pages.signIn).
import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protect everything except the auth pages, the auth API, the invite accept
  // flow, and static assets.
  matcher: ['/((?!api/auth|signin|verify-request|invite|_next/static|_next/image|favicon.ico).*)'],
};
