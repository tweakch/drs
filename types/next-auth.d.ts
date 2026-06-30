// Auth.js type augmentation (DRS-0003). Enrich the session user with the
// platform-admin flag and the caller's memberships (set in the `session` callback).
import type { DefaultSession } from 'next-auth';
import type { SessionMembership } from '@/lib/auth/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isPlatformAdmin: boolean;
      memberships: SessionMembership[];
    } & DefaultSession['user'];
  }

  interface User {
    isPlatformAdmin?: boolean;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    isPlatformAdmin?: boolean;
  }
}
