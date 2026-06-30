'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-20 text-center">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-hot">
        Something went wrong
      </h2>
      <p className="mb-6 text-dim">An unexpected error occurred while rendering this view.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border border-line px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-paint hover:border-cool"
      >
        Try again
      </button>
    </div>
  );
}
