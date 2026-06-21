// P11-018: Admin roles list page.
// Displays all roles from the backend. Backend is final authority.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import { fetchAdminRoles, type AdminRole } from '../../../lib/api/admin-roles-api';
import { AdminApiClientError } from '../../../lib/api';

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

  return (
    <section className="aim-roles-page">
      <header className="aim-roles-header">
        <p className="eyebrow">Admin — Roles & Permissions</p>
        <h1>Roles</h1>
        <p className="aim-roles-meta">
          {roles.length} role{roles.length !== 1 ? 's' : ''} configured
        </p>
      </header>

      <div className="admin-boundary-note">
        <strong>Security boundary:</strong> Role data is read from the backend.
        Role enforcement is the backend&apos;s responsibility.
      </div>

      {fetchError && (
        <div className="admin-error-banner" role="alert">
          {fetchError}
        </div>
      )}

      {!fetchError && roles.length === 0 && (
        <p className="admin-empty-state">No roles found.</p>
      )}

      {roles.length > 0 && (
        <div className="aim-table-wrapper">
          <table className="aim-table">
            <thead>
              <tr>
                <th scope="col" className="aim-table-th">Key</th>
                <th scope="col" className="aim-table-th">Name</th>
                <th scope="col" className="aim-table-th">Description</th>
                <th scope="col" className="aim-table-th">System</th>
                <th scope="col" className="aim-table-th">Created</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="aim-table-row">
                  <td className="aim-table-td">
                    <Link
                      href={`/admin/roles/${encodeURIComponent(role.key)}`}
                      className="aim-roles-link"
                    >
                      <span className={`admin-badge admin-badge--type-${role.key}`}>
                        {role.key}
                      </span>
                    </Link>
                  </td>
                  <td className="aim-table-td">{role.name}</td>
                  <td className="aim-table-td aim-roles-desc">
                    {role.description ?? <span className="admin-null">—</span>}
                  </td>
                  <td className="aim-table-td">
                    {role.isSystem ? (
                      <span className="admin-badge admin-badge--status-active">system</span>
                    ) : (
                      <span className="admin-badge admin-badge--status-pending">custom</span>
                    )}
                  </td>
                  <td className="aim-table-td admin-table-date">
                    {formatDate(role.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .aim-roles-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }
        .aim-roles-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .aim-roles-meta {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .aim-roles-link {
          text-decoration: none;
        }
        .aim-roles-link:hover .admin-badge {
          opacity: 0.85;
        }
        .aim-roles-desc {
          max-width: 360px;
          color: var(--text-secondary);
          font-size: 13px;
        }
      `}</style>
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
