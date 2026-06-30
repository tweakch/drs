// Bootstrap-admin allowlist (DRS-0003). A matching email is granted the
// platform-admin flag on first sign-in. Read straight from process.env so it
// works at request time without forcing the full env schema.

/** Parsed, lower-cased ADMIN_EMAILS allowlist (comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

/** True when `email` is on the bootstrap-admin allowlist. */
export function isBootstrapAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
