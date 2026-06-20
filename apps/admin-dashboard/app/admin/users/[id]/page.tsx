import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminUserDetail,
  type AdminUserDetail,
} from '../../../../lib/api/admin-users-api';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { AdminPageHeader } from '../../../../components/layout';
import { AdminCard, AdminBadge, AdminStatusBadge, AdminIdCell, AdminDateCell } from '../../../../components/common';
import { AdminApiErrorState } from '../../../../components/error-handling';
import { RoleChangeForm } from './role-change-form';

type Props = {
  params: Promise<{ id: string }>;
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="aim-detail-row">
      <dt className="aim-detail-label">{label}</dt>
      <dd className="aim-detail-value">{children}</dd>
    </div>
  );
}

function NullValue() {
  return <span style={{ color: 'var(--text-muted)' }}>—</span>;
}

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
    <section>
      <nav style={{ marginBlockEnd: 'var(--space-16)' }}>
        <Link
          href="/admin/users"
          className="aim-back-link"
        >
          ← Back to Users
          <style>{`
            .aim-back-link {
              font-size: 14px;
              color: var(--text-link);
              text-decoration: none;
              font-weight: var(--weight-medium);
            }
            .aim-back-link:hover { text-decoration: underline; }
            .aim-back-link:focus-visible {
              outline: 2px solid var(--focus-ring);
              outline-offset: 2px;
              border-radius: var(--radius-xs);
            }
          `}</style>
        </Link>
      </nav>

      <AdminPageHeader
        eyebrow="User Management"
        title="User Detail"
        description={user ? user.email ?? user.id : undefined}
      />

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {user && (
        <div className="aim-detail-grid">
          <AdminCard title="Identity">
            <dl className="aim-detail-list">
              <DetailRow label="ID">
                <AdminIdCell id={user.id} />
              </DetailRow>
              <DetailRow label="Email">
                {user.email ?? <NullValue />}
              </DetailRow>
              <DetailRow label="Phone">
                {user.phone ?? <NullValue />}
              </DetailRow>
              <DetailRow label="Type">
                <AdminBadge variant="primary">{user.userType}</AdminBadge>
              </DetailRow>
              <DetailRow label="Status">
                <AdminStatusBadge status={user.status} />
              </DetailRow>
              <DetailRow label="Created">
                <AdminDateCell iso={user.createdAt} />
              </DetailRow>
              <DetailRow label="Updated">
                <AdminDateCell iso={user.updatedAt} />
              </DetailRow>
            </dl>
          </AdminCard>

          <AdminCard title="Roles">
            {user.roles.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                No roles assigned.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
                {user.roles.map((role) => (
                  <AdminBadge key={role} variant="info">{role}</AdminBadge>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard title="Student Profile">
            {!user.studentProfile ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                No student profile.
              </p>
            ) : (
              <dl className="aim-detail-list">
                <DetailRow label="Display Name">
                  {user.studentProfile.displayName ?? <NullValue />}
                </DetailRow>
                <DetailRow label="Native Language">
                  {user.studentProfile.nativeLanguage ?? <NullValue />}
                </DetailRow>
                <DetailRow label="Target Language">
                  {user.studentProfile.targetLanguage ?? <NullValue />}
                </DetailRow>
                <DetailRow label="Created">
                  <AdminDateCell iso={user.studentProfile.createdAt} />
                </DetailRow>
              </dl>
            )}
          </AdminCard>

          <AdminCard title="Admin Profile">
            {!user.adminProfile ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                No admin profile.
              </p>
            ) : (
              <dl className="aim-detail-list">
                <DetailRow label="Display Name">
                  {user.adminProfile.displayName ?? <NullValue />}
                </DetailRow>
                <DetailRow label="Department">
                  {user.adminProfile.department ?? <NullValue />}
                </DetailRow>
                <DetailRow label="Created">
                  <AdminDateCell iso={user.adminProfile.createdAt} />
                </DetailRow>
              </dl>
            )}
          </AdminCard>

          <RoleChangeForm
            token={token}
            userId={user.id}
            currentRoles={user.roles}
            userType={user.userType}
          />

          <style>{`
            .aim-detail-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
              gap: var(--section-gap);
            }
            .aim-detail-list {
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              gap: var(--space-12);
            }
            .aim-detail-row {
              display: flex;
              align-items: baseline;
              gap: var(--space-12);
            }
            .aim-detail-label {
              flex-shrink: 0;
              width: 130px;
              font-size: 13px;
              font-weight: var(--weight-medium);
              color: var(--text-secondary);
            }
            .aim-detail-value {
              margin: 0;
              font-size: 14px;
              color: var(--text-primary);
              word-break: break-word;
            }
            @media (max-width: 480px) {
              .aim-detail-row {
                flex-direction: column;
                gap: var(--space-2);
              }
              .aim-detail-label { width: auto; }
              .aim-detail-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}
