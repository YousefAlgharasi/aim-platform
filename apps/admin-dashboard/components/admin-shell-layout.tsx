import type { ReactNode } from 'react';

import type { AdminAuthContext } from '../lib/auth';
import { AdminNavigation } from './admin-navigation';

export function AdminShellLayout({
  authContext,
  children,
}: Readonly<{
  authContext: AdminAuthContext;
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--background)]">
      <AdminNavigation authContext={authContext} />
      <div className="flex-1 min-w-0 flex flex-col">
        <main
          id="main-content"
          className="flex-1 p-4 pt-16 md:p-8 max-w-[1200px] w-full mx-auto outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
