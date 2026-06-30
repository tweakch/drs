import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-20 pt-7">
      <Header />
      <TabNav />
      {children}
    </div>
  );
}
