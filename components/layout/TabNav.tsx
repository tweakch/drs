'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VIEWS } from './views';

export function TabNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const views = isAdmin ? [{ key: 'admin', label: 'Admin', href: '/admin' }, ...VIEWS] : VIEWS;

  return (
    <nav className="mb-6 flex flex-wrap gap-0.5 border-b-2 border-line">
      {views.map((view) => {
        const active = pathname === view.href;
        return (
          <Link
            key={view.key}
            href={view.href}
            aria-current={active ? 'page' : undefined}
            className={[
              '-mb-0.5 border-b-2 px-4 py-3 text-[13px] font-bold uppercase tracking-[0.06em]',
              active ? 'border-hot text-paint' : 'border-transparent text-muted hover:text-paint',
            ].join(' ')}
          >
            {view.label}
          </Link>
        );
      })}
    </nav>
  );
}
