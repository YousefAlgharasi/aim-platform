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

const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  active: { bg: 'color-mix(in srgb, var(--color-success-500) 12%, transparent)', fg: 'var(--color-success-600)', dot: 'var(--color-success-500)' },
  pending: { bg: 'color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent)', fg: 'var(--color-warning-600, #d97706)', dot: 'var(--color-warning-500, #f59e0b)' },
  disabled: { bg: 'color-mix(in srgb, var(--color-error-500) 12%, transparent)', fg: 'var(--color-error-600)', dot: 'var(--color-error-500)' },
  deleted: { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', dot: 'var(--text-muted)' },
};

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  student: { bg: '#e0f2fe', fg: '#0369a1' },
  admin: { bg: '#ede9fe', fg: '#6d28d9' },
  super_admin: { bg: '#fce7f3', fg: '#be185d' },
  reviewer: { bg: '#d1fae5', fg: '#065f46' },
  support: { bg: '#fff7ed', fg: '#c2410c' },
  system: { bg: '#f1f5f9', fg: '#475569' },
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

  const sc = STATUS_COLORS[user?.status ?? ''] ?? STATUS_COLORS.active;
  const tc = TYPE_COLORS[user?.userType ?? ''] ?? TYPE_COLORS.student;

  return (
    <section className="aim-ud-page">
      <Link href="/admin/users" className="aim-ud-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Users
      </Link>

      {fetchError && (
        <div className="admin-error-banner" role="alert">{fetchError}</div>
      )}

      {user && (
        <>
          {/* Profile Header */}
          <div className="aim-ud-hero">
            <div className="aim-ud-avatar" style={{ background: tc.bg, color: tc.fg }}>
              {(user.email ?? '?')[0].toUpperCase()}
            </div>
            <div className="aim-ud-hero-info">
              <h1 className="aim-ud-name">{user.email ?? 'No email'}</h1>
              <div className="aim-ud-meta">
                <span className="aim-ud-type-badge" style={{ background: tc.bg, color: tc.fg }}>
                  {user.userType}
                </span>
                <span className="aim-ud-status-badge" style={{ background: sc.bg, color: sc.fg }}>
                  <span className="aim-ud-status-dot" style={{ background: sc.dot }} />
                  {user.status}
                </span>
                <span className="aim-ud-joined">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="aim-ud-grid">
            {/* Identity Card */}
            <div className="aim-ud-card">
              <h3 className="aim-ud-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                Identity
              </h3>
              <div className="aim-ud-rows">
                <Row label="User ID" mono>{user.id}</Row>
                <Row label="Email">{user.email ?? '—'}</Row>
                <Row label="Phone">{user.phone ?? '—'}</Row>
                <Row label="Created">{formatDate(user.createdAt)}</Row>
                <Row label="Updated">{formatDate(user.updatedAt)}</Row>
              </div>
            </div>

            {/* Roles Card */}
            <div className="aim-ud-card">
              <h3 className="aim-ud-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                Roles & Permissions
              </h3>
              {user.roles.length === 0 ? (
                <p className="aim-ud-empty">No roles assigned</p>
              ) : (
                <div className="aim-ud-roles-list">
                  {user.roles.map((role) => {
                    const rc = TYPE_COLORS[role] ?? { bg: '#f1f5f9', fg: '#475569' };
                    return (
                      <Link key={role} href={`/admin/roles/${role}`} className="aim-ud-role-chip" style={{ background: rc.bg, color: rc.fg }}>
                        {role}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Student Profile */}
            <div className="aim-ud-card">
              <h3 className="aim-ud-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"/></svg>
                Student Profile
              </h3>
              {!user.studentProfile ? (
                <p className="aim-ud-empty">No student profile</p>
              ) : (
                <div className="aim-ud-rows">
                  <Row label="Display Name">{user.studentProfile.displayName ?? '—'}</Row>
                  <Row label="Native Lang">{user.studentProfile.nativeLanguage ?? '—'}</Row>
                  <Row label="Target Lang">{user.studentProfile.targetLanguage ?? '—'}</Row>
                  <Row label="Created">{formatDate(user.studentProfile.createdAt)}</Row>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="aim-ud-card">
              <h3 className="aim-ud-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.42 15.17l-5.1-5.1a1 1 0 010-1.42l.71-.71a1 1 0 011.42 0L12 11.49l3.54-3.54a1 1 0 011.42 0l.71.71a1 1 0 010 1.42l-5.1 5.1a1 1 0 01-1.42 0z"/></svg>
                Admin Profile
              </h3>
              {!user.adminProfile ? (
                <p className="aim-ud-empty">No admin profile</p>
              ) : (
                <div className="aim-ud-rows">
                  <Row label="Display Name">{user.adminProfile.displayName ?? '—'}</Row>
                  <Row label="Department">{user.adminProfile.department ?? '—'}</Row>
                  <Row label="Created">{formatDate(user.adminProfile.createdAt)}</Row>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="aim-ud-actions-grid">
            <UserStatusActions userId={user.id} currentStatus={user.status} />
            <RoleChangeForm userId={user.id} currentRoles={user.roles} userType={user.userType} />
          </div>
        </>
      )}

      <style>{`
        .aim-ud-page { display: flex; flex-direction: column; gap: 24px; }
        .aim-ud-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--text-link);
          text-decoration: none; width: fit-content;
        }
        .aim-ud-back:hover { text-decoration: underline; }

        .aim-ud-hero {
          display: flex; gap: 20px; align-items: center;
          padding: 24px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .aim-ud-avatar {
          width: 64px; height: 64px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 700; flex-shrink: 0;
        }
        .aim-ud-hero-info { min-width: 0; flex: 1; }
        .aim-ud-name {
          margin: 0; font-size: 22px; font-weight: 700; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .aim-ud-meta {
          display: flex; align-items: center; gap: 10px; margin-top: 8px; flex-wrap: wrap;
        }
        .aim-ud-type-badge {
          padding: 3px 10px; border-radius: 6px; font-size: 12px;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
        }
        .aim-ud-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
        }
        .aim-ud-status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .aim-ud-joined { font-size: 13px; color: var(--text-muted); }

        .aim-ud-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
        }
        .aim-ud-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 20px;
        }
        .aim-ud-card-title {
          display: flex; align-items: center; gap: 8px;
          margin: 0 0 16px 0; font-size: 15px; font-weight: 600;
          color: var(--text-primary);
        }
        .aim-ud-rows { display: flex; flex-direction: column; gap: 10px; }
        .aim-ud-row {
          display: flex; align-items: baseline; gap: 12px;
        }
        .aim-ud-row-label {
          flex-shrink: 0; width: 100px; font-size: 12px; font-weight: 500;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em;
        }
        .aim-ud-row-value {
          font-size: 14px; color: var(--text-primary); word-break: break-all;
        }
        .aim-ud-row-value--mono {
          font-family: var(--font-mono, monospace); font-size: 12px;
          background: var(--surface-sunken); padding: 2px 6px; border-radius: 4px;
        }
        .aim-ud-empty { margin: 0; font-size: 13px; color: var(--text-muted); font-style: italic; }
        .aim-ud-roles-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .aim-ud-role-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: opacity 0.15s;
        }
        .aim-ud-role-chip:hover { opacity: 0.8; }

        .aim-ud-actions-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
        }

        @media (max-width: 640px) {
          .aim-ud-grid, .aim-ud-actions-grid { grid-template-columns: 1fr; }
          .aim-ud-hero { flex-direction: column; text-align: center; }
          .aim-ud-meta { justify-content: center; }
          .aim-ud-row { flex-direction: column; gap: 2px; }
          .aim-ud-row-label { width: auto; }
        }
      `}</style>
    </section>
  );
}

function Row({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="aim-ud-row">
      <span className="aim-ud-row-label">{label}</span>
      <span className={`aim-ud-row-value${mono ? ' aim-ud-row-value--mono' : ''}`}>{children}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch { return '—'; }
}
