export function EmptyState({ title, message }: { title?: string; message: string }) {
  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-12 text-center">
      {title ? (
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {title}
        </h2>
      ) : null}
      <p className="text-dim">{message}</p>
    </div>
  );
}
