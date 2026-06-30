// Coarse, DB-free route gate (DRS-0003). The real, DB-backed authorization runs
// in the (app) layout via auth(); this middleware only checks for the *presence*
// of a session cookie and redirects anonymous requests to /signin.
//
// We deliberately do NOT run `NextAuth(authConfig).auth` here. Sessions use the
// `database` strategy (see auth.ts), so the cookie is an opaque session-token
// reference — not a JWE. The Edge runtime has no DB adapter, so NextAuth falls
// back to JWT decoding and throws `JWTSessionError: Invalid Compact JWE`, which
// bounced freshly-signed-in users straight back to /signin. Validating the token
// requires the DB, which is why that check belongs in the Node-runtime layout.
import { NextResponse, type NextRequest } from 'next/server';

// Auth.js default session cookie names. The `__Secure-` prefix is used whenever
// cookies are secure (production over HTTPS); the bare name is used in local dev.
// Database sessions are short tokens, so they are never chunked (.0/.1 suffixes).
const SESSION_COOKIES = ['__Secure-authjs.session-token', 'authjs.session-token'];

export function middleware(req: NextRequest) {
  const signedIn = SESSION_COOKIES.some((name) => req.cookies.has(name));
  if (signedIn) return NextResponse.next();

  return NextResponse.redirect(new URL('/signin', req.nextUrl.origin));
}

export const config = {
  // Protect everything except the auth pages, the auth API, the invite accept
  // flow, and static assets.
  matcher: ['/((?!api/auth|signin|verify-request|invite|_next/static|_next/image|favicon.ico).*)'],
};
