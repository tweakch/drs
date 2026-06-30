import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { acceptInvitation } from '@/lib/auth/invitations';

export const dynamic = 'force-dynamic';

// Invitation accept flow. Must be signed in (so we have a userId to bind the new
// Membership to); the raw token comes only from the URL and is verified by hash.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/signin?callbackUrl=/invite/${encodeURIComponent(token)}`);
  }

  const userId = session.user.id;

  async function accept() {
    'use server';
    const result = await acceptInvitation(token, userId);
    if (result.ok) redirect('/data');
    redirect(`/invite/${encodeURIComponent(token)}?error=1`);
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 py-24 text-center">
      <h1 className="mb-2 text-2xl font-extrabold uppercase tracking-tight text-paint">
        Accept invitation
      </h1>
      <p className="mb-6 text-dim">
        Signed in as {session.user.email}. Accept to join with the role you were invited for.
      </p>
      <form action={accept}>
        <button
          type="submit"
          className="rounded-md border border-hot bg-hot/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-paint hover:bg-hot/20"
        >
          Accept invitation
        </button>
      </form>
      <p className="mt-4 text-[12px] text-dim">
        If this link is expired or already used, ask your inviter to send a new one.
      </p>
    </div>
  );
}
