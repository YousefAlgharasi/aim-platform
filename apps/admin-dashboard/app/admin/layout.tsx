import type { ReactNode } from 'react';

import { AdminShellLayout } from '../../components/admin-shell-layout';

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
