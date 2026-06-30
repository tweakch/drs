// Resolve the magic-link "from" address for the Resend provider.
//
// Resend only sends from its shared onboarding sender or a domain you have
// verified. A free-mail domain (outlook.com, gmail.com, …) can NEVER be verified,
// so an AUTH_EMAIL_FROM pointing at one is always a misconfiguration that makes
// Resend reject every send with a 403 ("domain is not verified") — which surfaced
// as a recurring [auth][error] in production. Fall back to the onboarding sender in
// that case so sign-in still works; a real verified domain is used as-is.
const RESEND_FALLBACK_FROM = 'onboarding@resend.dev';

const UNVERIFIABLE_DOMAINS = new Set([
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'gmx.com',
  'gmx.net',
  'web.de',
  'proton.me',
  'protonmail.com',
]);

/** Extract the bare email address from a "Name <addr@host>" or "addr@host" string. */
function addressOf(value: string): string {
  const angle = value.match(/<([^>]+)>\s*$/);
  return (angle ? angle[1] : value).trim();
}

export function resolveEmailFrom(value: string | undefined | null): string {
  if (!value || !value.trim()) return RESEND_FALLBACK_FROM;
  const domain = addressOf(value).split('@')[1]?.toLowerCase();
  if (!domain || UNVERIFIABLE_DOMAINS.has(domain)) return RESEND_FALLBACK_FROM;
  return value;
}
