// Phase 2 — P2-062
// Admin user detail page.
//
// Scope: Auth, Users, Roles only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - This page only renders data returned by the backend — it makes no authorization decisions.
// - Role/permission enforcement is the backend's responsibility.
// - supabaseAuthUid is never present in the response (stripped by backend).

import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminUserDetail,
  type AdminUserDetail,
} from '../../../../lib/api/admin-users-api';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { RoleChangeForm } from './role-change-form';
import { UserStatusActions } from './user-status-actions';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let user: AdminUserDetail | null = null;
  let fetchError: string | null = null;

  try {
    user = await fetchAdminUserDetail(token, id);
  } catch (error) {
    if (error instanceof AdminApiClientError && error.status === 404) {
      notFound();
    }

    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load user. Check backend connectivity.';
  }

  return (
    <section className="admin-user-detail-page">
      <nav className="admin-breadcrumb">
        <Link href="/admin/users" className="admin-breadcrumb-link">
          ← Users
        </Link>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — User Management</p>
        <h1>User Detail</h1>
        {user && (
          <p className="admin-page-meta admin-table-id" title={user.id}>
            {user.id}
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Security boundary:</strong> This page renders backend-approved
        data only. Role enforcement and data filtering are backend
        responsibilities.
      </div>

      {fetchError && (
        <div className="admin-error-banner" role="alert">
          {fetchError}
        </div>
      )}

      {user && (
        <div className="admin-detail-grid">
          {/* Identity */}
          <section className="admin-detail-card">
            <h2 className="admin-detail-card-title">Identity</h2>
            <dl className="admin-detail-list">
              <div className="admin-detail-row">
                <dt>ID</dt>
                <dd className="admin-table-id">{user.id}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Email</dt>
                <dd>{user.email ?? <span className="admin-null">—</span>}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Phone</dt>
                <dd>{user.phone ?? <span className="admin-null">—</span>}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Type</dt>
                <dd>
                  <span className={`admin-badge admin-badge--type-${user.userType}`}>
                    {user.userType}
                  </span>
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>Status</dt>
                <dd>
                  <span className={`admin-badge admin-badge--status-${user.status}`}>
                    {user.status}
                  </span>
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>Created</dt>
                <dd className="admin-table-date">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Updated</dt>
                <dd className="admin-table-date">{formatDate(user.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {/* Roles */}
          <section className="admin-detail-card">
            <h2 className="admin-detail-card-title">Roles</h2>
            {user.roles.length === 0 ? (
              <p className="admin-empty-state">No roles assigned.</p>
            ) : (
              <ul className="admin-role-badge-list">
                {user.roles.map((role) => (
                  <li key={role}>
                    <span className={`admin-badge admin-badge--type-${role}`}>
                      {role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Student Profile */}
          <section className="admin-detail-card">
            <h2 className="admin-detail-card-title">Student Profile</h2>
            {!user.studentProfile ? (
              <p className="admin-empty-state">No student profile.</p>
            ) : (
              <dl className="admin-detail-list">
                <div className="admin-detail-row">
                  <dt>Display Name</dt>
                  <dd>
                    {user.studentProfile.displayName ?? (
                      <span className="admin-null">—</span>
                    )}
                  </dd>
                </div>
                <div className="admin-detail-row">
                  <dt>Native Language</dt>
                  <dd>
                    {user.studentProfile.nativeLanguage ?? (
                      <span className="admin-null">—</span>
                    )}
                  </dd>
                </div>
                <div className="admin-detail-row">
                  <dt>Target Language</dt>
                  <dd>
                    {user.studentProfile.targetLanguage ?? (
                      <span className="admin-null">—</span>
                    )}
                  </dd>
                </div>
                <div className="admin-detail-row">
                  <dt>Created</dt>
                  <dd className="admin-table-date">
                    {formatDate(user.studentProfile.createdAt)}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          {/* Admin Profile */}
          <section className="admin-detail-card">
            <h2 className="admin-detail-card-title">Admin Profile</h2>
            {!user.adminProfile ? (
              <p className="admin-empty-state">No admin profile.</p>
            ) : (
              <dl className="admin-detail-list">
                <div className="admin-detail-row">
                  <dt>Display Name</dt>
                  <dd>
                    {user.adminProfile.displayName ?? (
                      <span className="admin-null">—</span>
                    )}
                  </dd>
                </div>
                <div className="admin-detail-row">
                  <dt>Department</dt>
                  <dd>
                    {user.adminProfile.department ?? (
                      <span className="admin-null">—</span>
                    )}
                  </dd>
                </div>
                <div className="admin-detail-row">
                  <dt>Created</dt>
                  <dd className="admin-table-date">
                    {formatDate(user.adminProfile.createdAt)}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          {/* Status Actions — client component, token passed from server */}
          <UserStatusActions
            token={token}
            userId={user.id}
            currentStatus={user.status}
          />

          {/* Role Change — client component, token passed from server */}
          <RoleChangeForm
            token={token}
            userId={user.id}
            currentRoles={user.roles}
            userType={user.userType}
          />
        </div>
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
