import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-20 text-center">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-hot">404</h2>
      <p className="mb-6 text-dim">That view does not exist.</p>
      <Link
        href="/data"
        className="rounded-md border border-line px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-paint hover:border-cool"
      >
        Back to Data
      </Link>
    </div>
  );
}
