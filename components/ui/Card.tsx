import type { ReactNode } from 'react';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-asphalt-2 p-4">
      {title ? (
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}
