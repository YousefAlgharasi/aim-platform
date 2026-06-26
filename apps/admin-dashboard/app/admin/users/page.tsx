import { cookies } from 'next/headers';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import {
  fetchAdminUsers,
  type AdminUserListItem,
  type AdminUserStatus,
  type AdminUserType,
} from '../../../lib/api/admin-users-api';
import { AdminApiClientError } from '../../../lib/api';
import { UsersPageClient } from './users-page-client';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const STATUS_OPTIONS: AdminUserStatus[] = ['active', 'pending', 'disabled', 'deleted'];
const TYPE_OPTIONS: AdminUserType[] = ['student', 'admin', 'reviewer', 'support', 'system'];

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    userType?: string;
    email?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(sp.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100,
  );
  const status = STATUS_OPTIONS.includes(sp.status as AdminUserStatus)
    ? (sp.status as AdminUserStatus)
    : undefined;
  const userType = TYPE_OPTIONS.includes(sp.userType as AdminUserType)
    ? (sp.userType as AdminUserType)
    : undefined;
  const email = sp.email?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let users: AdminUserListItem[] = [];
  let total = 0;
  let fetchError: string | null = null;

  try {
    const data = await fetchAdminUsers({ token, page, limit, status, userType, email });
    users = data.users;
    total = data.total;
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load users. Check backend connectivity.';
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {fetchError && (
        <div className="admin-error-banner" role="alert">{fetchError}</div>
      )}

      <UsersPageClient
        initialUsers={users}
        initialTotal={total}
        initialPage={page}
        initialLimit={limit}
        initialEmail={email}
        initialStatus={status}
        initialUserType={userType}
      />
    </section>
  );
}
