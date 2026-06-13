// Phase 2 — P2-060
// Admin users list page.
//
// Scope: Auth, Users, Roles only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - Auth state enforcement is handled by the parent layout (admin/layout.tsx).
// - This page only renders data returned by the backend — it makes no authorization decisions.
// - Role/permission enforcement is the backend's responsibility.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import { fetchAdminUsers, type AdminUserListItem } from '../../../lib/api/admin-users-api';
import { AdminApiClientError } from '../../../lib/api';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: { users: AdminUserListItem[]; total: number; page: number; limit: number } | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminUsers(token, page, limit);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load users. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section className="admin-users-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — User Management</p>
        <h1>Users</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} user{data.total !== 1 ? 's' : ''} total
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Security boundary:</strong> This list is served by the backend
        API. Role enforcement and data filtering are backend responsibilities.
        This dashboard renders backend-approved data only.
      </div>

      {fetchError && (
        <div className="admin-error-banner" role="alert">
          {fetchError}
        </div>
      )}

      {data && data.users.length === 0 && !fetchError && (
        <p className="admin-empty-state">No users found.</p>
      )}

      {data && data.users.length > 0 && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Email</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td className="admin-table-id" title={user.id}>
                      {user.id.slice(0, 8)}…
                    </td>
                    <td>{user.email ?? <span className="admin-null">—</span>}</td>
                    <td>
                      <span className={`admin-badge admin-badge--type-${user.userType}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="admin-table-date">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="admin-pagination" aria-label="User list pagination">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}&limit=${limit}`}
                  className="admin-pagination-link"
                >
                  ← Previous
                </Link>
              )}
              <span className="admin-pagination-info">
                Page {data.page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}&limit=${limit}`}
                  className="admin-pagination-link"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </section>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
