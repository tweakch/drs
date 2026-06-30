// Shown after requesting a magic link.
export default function VerifyRequestPage() {
  return (
    <div className="mx-auto max-w-[420px] px-6 py-24 text-center">
      <h1 className="mb-2 text-2xl font-extrabold uppercase tracking-tight text-paint">
        Check your email
      </h1>
      <p className="text-dim">
        A sign-in link is on its way. Open it on this device to continue. You can close this tab.
      </p>
    </div>
  );
}
