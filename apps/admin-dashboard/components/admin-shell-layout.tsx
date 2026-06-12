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
    <div className="admin-dashboard-layout">
      <AdminNavigation authContext={authContext} />
      <main className="admin-dashboard-main">{children}</main>
    </div>
  );
}
