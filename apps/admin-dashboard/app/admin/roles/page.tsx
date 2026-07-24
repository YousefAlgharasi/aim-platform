import { cookies } from 'next/headers';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import { AdminApiClientError } from '../../../lib/api';
import { fetchAdminRoles, RolesView, type AdminRole } from '../../../features/roles';

export default async function AdminRolesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let roles: AdminRole[] = [];
  let fetchError: string | null = null;

  try {
    const data = await fetchAdminRoles(token);
    roles = data.roles;
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load roles. Check backend connectivity.';
  }

  return <RolesView roles={roles} fetchError={fetchError} />;
}
