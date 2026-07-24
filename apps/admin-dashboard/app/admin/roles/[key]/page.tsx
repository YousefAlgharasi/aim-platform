// P11-018: Admin role detail page with permissions.
// Backend is final authority for role/permission data.

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { AdminApiClientError } from '../../../../core/api';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../core/auth';
import {
  fetchAdminRoleDetail,
  PermissionsComponent,
  type AdminRoleWithPermissions,
} from '../../../../features/roles';

type Props = {
  params: Promise<{ key: string }>;
};

export default async function AdminRoleDetailPage({ params }: Props) {
  const { key } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminRoleWithPermissions | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminRoleDetail(token, key);
  } catch (error) {
    if (error instanceof AdminApiClientError && error.status === 404) {
      notFound();
    }

    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load role detail. Check backend connectivity.';
  }

  if (!data && !fetchError) {
    notFound();
  }

  return (
    <PermissionsComponent
      data={data ?? { role: { id: '', key: '', name: '', description: null, isSystem: false, createdAt: '', updatedAt: '' }, permissions: [] }}
      fetchError={fetchError}
    />
  );
}
