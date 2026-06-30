// Full Auth.js config (DRS-0003). Node-runtime only (DB adapter). Importing this
// module never connects: `new Pool(...)` is lazy and does not dial the database,
// so `next build` is green with no DATABASE_URL set.
import NextAuth from 'next-auth';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from '@neondatabase/serverless';
import authConfig from './auth.config';
import { isBootstrapAdmin } from '@/lib/auth/admin';
import { getUserMemberships, setUserPlatformAdmin } from '@/lib/db/queries';

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(getPool()),
  session: {
    strategy: 'database',
    maxAge: 60 * 60 * 24 * 30, // 30 days, rolling (refreshed on use)
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      // Bootstrap: first sign-in by an allowlisted email becomes platform admin.
      if (user.id && isBootstrapAdmin(user.email)) {
        await setUserPlatformAdmin(user.id);
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.isPlatformAdmin = Boolean(user.isPlatformAdmin);
      session.user.memberships = await getUserMemberships(user.id);
      return session;
    },
  },
});
