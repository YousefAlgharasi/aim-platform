import type { ReactNode } from 'react';

import { AdminNavigation } from './admin-navigation';

export function AdminShellLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="admin-dashboard-layout">
      <AdminNavigation />
      <main className="admin-dashboard-main">{children}</main>
    </div>
  );
}
