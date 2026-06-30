import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';

// auth() reads the session cookie, so every (app) route renders dynamically and
// never touches the DB at build time.
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  // The real, DB-backed gate (middleware is only a coarse redirect).
  const session = await auth();
  if (!session?.user) redirect('/signin');

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-20 pt-7">
      <Header />
      <div className="mb-4 flex items-center justify-end gap-3 text-[12px] text-muted">
        <span>{session.user.email}</span>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/signin' });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-line px-3 py-1 font-bold uppercase tracking-[0.08em] text-paint hover:border-cool"
          >
            Sign out
          </button>
        </form>
      </div>
      <TabNav isAdmin={session.user.isPlatformAdmin} />
      {children}
    </div>
  );
}
