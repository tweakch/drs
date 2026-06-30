import { describe, expect, it } from 'vitest';
import { resolveEmailFrom } from './email-from';

const FALLBACK = 'onboarding@resend.dev';

describe('resolveEmailFrom', () => {
  it('falls back when unset/empty', () => {
    expect(resolveEmailFrom(undefined)).toBe(FALLBACK);
    expect(resolveEmailFrom(null)).toBe(FALLBACK);
    expect(resolveEmailFrom('   ')).toBe(FALLBACK);
  });

  it('falls back for unverifiable free-mail domains (the prod 403 cause)', () => {
    expect(resolveEmailFrom('alex.klee@outlook.com')).toBe(FALLBACK);
    expect(resolveEmailFrom('DRS <alex.klee@outlook.com>')).toBe(FALLBACK);
    expect(resolveEmailFrom('someone@gmail.com')).toBe(FALLBACK);
  });

  it('keeps a real (verifiable) domain as-is, preserving display name', () => {
    expect(resolveEmailFrom('login@drs.app')).toBe('login@drs.app');
    expect(resolveEmailFrom('DRS <login@drs.app>')).toBe('DRS <login@drs.app>');
  });

  it('falls back on a malformed value with no domain', () => {
    expect(resolveEmailFrom('not-an-email')).toBe(FALLBACK);
  });
});
