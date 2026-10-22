'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { RequireAuth, PendingProvider } from '@/lib/context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <PendingProvider>
        <div className="flex h-screen w-full overflow-hidden bg-[#e6f4f2]">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">{children}</main>
        </div>
      </PendingProvider>
    </RequireAuth>
  );
}
