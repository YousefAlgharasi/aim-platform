import Link from 'next/link';
import type { AdminRoleWithPermissions } from './admin-roles-api';

export type PermissionsComponentProps = {
  readonly data: AdminRoleWithPermissions;
  readonly fetchError?: string | null;
};

export function PermissionsComponent({ data, fetchError }: PermissionsComponentProps) {
  return (
    <section className="aim-role-detail-page">
      <nav className="admin-breadcrumb">
        <Link href="/admin/roles" className="admin-breadcrumb-link">
          ← Roles
        </Link>
      </nav>

      <header className="aim-role-detail-header">
        <p className="eyebrow">Admin — Roles & Permissions</p>
        <h1>Role Detail</h1>
        {data && (
          <p className="aim-role-detail-key">
            <span className={`admin-badge admin-badge--type-${data.role.key}`}>
              {data.role.key}
            </span>
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Security boundary:</strong> This page renders backend-approved
        data only. Permission enforcement is the backend&apos;s responsibility.
      </div>

      {fetchError && (
        <div className="admin-error-banner" role="alert">
          {fetchError}
        </div>
      )}

      {data && (
        <div className="aim-role-detail-grid">
          <section className="admin-detail-card">
            <h2 className="admin-detail-card-title">Role Information</h2>
            <dl className="admin-detail-list">
              <div className="admin-detail-row">
                <dt>ID</dt>
                <dd className="admin-table-id">{data.role.id}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Key</dt>
                <dd>{data.role.key}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Name</dt>
                <dd>{data.role.name}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Description</dt>
                <dd>
                  {data.role.description ?? <span className="admin-null">—</span>}
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>System Role</dt>
                <dd>
                  {data.role.isSystem ? (
                    <span className="admin-badge admin-badge--status-active">Yes</span>
                  ) : (
                    <span className="admin-badge admin-badge--status-pending">No</span>
                  )}
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>Created</dt>
                <dd className="admin-table-date">{formatDate(data.role.createdAt)}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Updated</dt>
                <dd className="admin-table-date">{formatDate(data.role.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-detail-card">
            <h2 className="admin-detail-card-title">
              Permissions ({data.permissions.length})
            </h2>

            {data.permissions.length === 0 ? (
              <p className="admin-empty-state">No permissions assigned to this role.</p>
            ) : (
              <div className="aim-table-wrapper">
                <table className="aim-table">
                  <thead>
                    <tr>
                      <th scope="col" className="aim-table-th">Key</th>
                      <th scope="col" className="aim-table-th">Scope</th>
                      <th scope="col" className="aim-table-th">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.permissions.map((perm) => (
                      <tr key={perm.id} className="aim-table-row">
                        <td className="aim-table-td">
                          <code className="aim-perm-key">{perm.key}</code>
                        </td>
                        <td className="aim-table-td">
                          <span className="admin-badge admin-badge--type-reviewer">
                            {perm.scope}
                          </span>
                        </td>
                        <td className="aim-table-td aim-perm-desc">
                          {perm.description ?? <span className="admin-null">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      <style>{`
        .aim-role-detail-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }
        .aim-role-detail-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .aim-role-detail-key {
          margin: 0;
        }
        .aim-role-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-24);
        }
        @media (min-width: 768px) {
          .aim-role-detail-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .aim-perm-key {
          font-size: 13px;
          font-family: var(--font-mono, monospace);
          background: var(--surface-sunken);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }
        .aim-perm-desc {
          max-width: 300px;
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
