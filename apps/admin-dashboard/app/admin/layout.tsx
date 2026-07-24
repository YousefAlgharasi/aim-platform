import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AdminShellLayout } from '../../shared/layouts/DashboardLayout';
import { getAdminAuthState } from '../../core/auth';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const authState = await getAdminAuthState();

  if (authState.status === 'unauthenticated') {
    redirect('/admin-auth-required');
  }

  if (authState.status === 'unauthorized') {
    redirect('/admin-unauthorized');
  }

  if (authState.status === 'unavailable') {
    redirect('/admin-auth-unavailable');
  }

  return (
    <AdminShellLayout authContext={authState.context}>
      {children}
    </AdminShellLayout>
  );
}
