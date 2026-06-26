import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import { fetchAdminRoles, type AdminRole } from '../../../lib/api/admin-roles-api';
import { AdminApiClientError } from '../../../lib/api';

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  super_admin: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#ef4444' },
  admin:       { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#3b82f6' },
  content_editor: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '#22c55e' },
  reviewer:    { bg: '#fefce8', border: '#fde68a', text: '#854d0e', icon: '#f59e0b' },
  student:     { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8', icon: '#a855f7' },
  support:     { bg: '#f0fdfa', border: '#99f6e4', text: '#115e59', icon: '#14b8a6' },
  system:      { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', icon: '#64748b' },
};

function getRoleColor(key: string) {
  return ROLE_COLORS[key] ?? ROLE_COLORS.system;
}

const ROLE_ICONS: Record<string, string> = {
  super_admin: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  admin: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
  content_editor: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  reviewer: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  student: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15v-3.75m0 0l5.25-3 5.25 3M12 21.75V15',
  support: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
};

function getRoleIcon(key: string) {
  return ROLE_ICONS[key] ?? 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z';
}

function formatDate(iso: string): string {
  if (!iso) return '--';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch { return iso; }
}

export default async function AdminRolesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let roles: AdminRole[] = [];
  let fetchError: string | null = null;

  try {
    const data = await fetchAdminRoles(token);
    roles = data.roles;
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status}: ${error.message}`
      : 'Failed to load roles. Check backend connectivity.';
  }

  const systemRoles = roles.filter(r => r.isSystem);
  const customRoles = roles.filter(r => !r.isSystem);

  return (
    <section className="roles-page">
      <header className="roles-header">
        <div>
          <h1 className="roles-title">Roles & Permissions</h1>
          <p className="roles-subtitle">Manage access control across the platform. {roles.length} role{roles.length !== 1 ? 's' : ''} configured.</p>
        </div>
      </header>

      {fetchError && (
        <div className="roles-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          {fetchError}
        </div>
      )}

      {!fetchError && roles.length === 0 && (
        <div className="roles-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #999)" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          <h3>No roles configured</h3>
          <p>Roles are defined in the database and managed by the backend.</p>
        </div>
      )}

      {systemRoles.length > 0 && (
        <div className="roles-section">
          <h2 className="roles-section-title">System Roles</h2>
          <div className="roles-grid">
            {systemRoles.map((role) => {
              const color = getRoleColor(role.key);
              return (
                <Link key={role.id} href={`/admin/roles/${encodeURIComponent(role.key)}`} className="role-card" style={{ '--role-bg': color.bg, '--role-border': color.border, '--role-text': color.text, '--role-icon': color.icon } as React.CSSProperties}>
                  <div className="role-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={getRoleIcon(role.key)} /></svg>
                  </div>
                  <div className="role-card-body">
                    <div className="role-card-head">
                      <h3 className="role-card-name">{role.name}</h3>
                      <span className="role-card-badge">System</span>
                    </div>
                    <p className="role-card-key">{role.key}</p>
                    {role.description && <p className="role-card-desc">{role.description}</p>}
                    <p className="role-card-date">Created {formatDate(role.createdAt)}</p>
                  </div>
                  <svg className="role-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {customRoles.length > 0 && (
        <div className="roles-section">
          <h2 className="roles-section-title">Custom Roles</h2>
          <div className="roles-grid">
            {customRoles.map((role) => {
              const color = getRoleColor(role.key);
              return (
                <Link key={role.id} href={`/admin/roles/${encodeURIComponent(role.key)}`} className="role-card" style={{ '--role-bg': color.bg, '--role-border': color.border, '--role-text': color.text, '--role-icon': color.icon } as React.CSSProperties}>
                  <div className="role-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={getRoleIcon(role.key)} /></svg>
                  </div>
                  <div className="role-card-body">
                    <div className="role-card-head">
                      <h3 className="role-card-name">{role.name}</h3>
                      <span className="role-card-badge role-card-badge--custom">Custom</span>
                    </div>
                    <p className="role-card-key">{role.key}</p>
                    {role.description && <p className="role-card-desc">{role.description}</p>}
                    <p className="role-card-date">Created {formatDate(role.createdAt)}</p>
                  </div>
                  <svg className="role-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="roles-info-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
        <p>Role enforcement is handled by the backend. Changes to roles and permissions require database-level access.</p>
      </div>

      <style>{`
        .roles-page { display: flex; flex-direction: column; gap: 28px; }
        .roles-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .roles-title { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-primary, #111); letter-spacing: -0.02em; }
        .roles-subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-muted, #999); }

        .roles-error {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 10px; font-size: 13px; color: #b91c1c;
        }
        .roles-empty {
          text-align: center; padding: 48px 24px;
          border: 1px dashed var(--border, #e5e5e5); border-radius: 14px;
        }
        .roles-empty h3 { margin: 16px 0 4px; font-size: 16px; font-weight: 600; color: var(--text-primary, #111); }
        .roles-empty p { margin: 0; font-size: 14px; color: var(--text-muted, #999); }

        .roles-section { display: flex; flex-direction: column; gap: 12px; }
        .roles-section-title {
          margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--text-muted, #999);
        }

        .roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }

        .role-card {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px; border-radius: 14px;
          border: 1px solid var(--role-border);
          background: var(--role-bg);
          text-decoration: none; color: inherit;
          transition: all 0.2s ease;
          position: relative;
        }
        .role-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .role-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: white;
          border: 1px solid var(--role-border);
          color: var(--role-icon);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .role-card-body { flex: 1; min-width: 0; }
        .role-card-head { display: flex; align-items: center; gap: 8px; }
        .role-card-name { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary, #111); }
        .role-card-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
          text-transform: uppercase; padding: 2px 7px; border-radius: 4px;
          background: var(--role-border); color: var(--role-text);
        }
        .role-card-badge--custom { background: var(--color-primary-100, #e0e7ff); color: var(--color-primary-700, #4338ca); }
        .role-card-key { margin: 2px 0 0; font-size: 12px; color: var(--text-muted, #999); font-family: monospace; }
        .role-card-desc { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary, #666); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .role-card-date { margin: 6px 0 0; font-size: 11px; color: var(--text-muted, #bbb); }

        .role-card-arrow {
          color: var(--text-muted, #ccc); flex-shrink: 0;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .role-card:hover .role-card-arrow { transform: translateX(3px); color: var(--role-icon); }

        .roles-info-banner {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px 18px; border-radius: 10px;
          background: var(--color-primary-50, #eef2ff); border: 1px solid var(--color-primary-100, #e0e7ff);
          color: var(--color-primary-700, #4338ca);
        }
        .roles-info-banner svg { flex-shrink: 0; margin-top: 1px; }
        .roles-info-banner p { margin: 0; font-size: 13px; line-height: 1.5; }

        @media (max-width: 600px) {
          .roles-grid { grid-template-columns: 1fr; }
          .roles-title { font-size: 20px; }
        }
      `}</style>
    </section>
  );
}
