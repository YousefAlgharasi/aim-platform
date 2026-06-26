import { cookies } from 'next/headers';
import Link from 'next/link';

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

  let data: { users: AdminUserListItem[]; total: number; page: number; limit: number } | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminUsers({ token, page, limit, status, userType, email });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load users. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  const statusCounts = data
    ? {
        active: data.users.filter((u) => u.status === 'active').length,
        pending: data.users.filter((u) => u.status === 'pending').length,
        disabled: data.users.filter((u) => u.status === 'disabled').length,
      }
    : { active: 0, pending: 0, disabled: 0 };

  return (
    <section className="aim-users-page">
      {/* Header */}
      <div className="aim-users-header">
        <div className="aim-users-header-left">
          <p className="aim-eyebrow">User Management</p>
          <h1 className="aim-users-title">Users</h1>
          {data && (
            <p className="aim-users-subtitle">
              {data.total} user{data.total !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <UsersPageClient />
      </div>

      {/* Stats Row */}
      {data && (
        <div className="aim-users-stats">
          <div className="aim-stat-pill aim-stat-pill--active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>{statusCounts.active} Active</span>
          </div>
          <div className="aim-stat-pill aim-stat-pill--pending">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>{statusCounts.pending} Pending</span>
          </div>
          <div className="aim-stat-pill aim-stat-pill--disabled">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            <span>{statusCounts.disabled} Disabled</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <form action="/admin/users" method="GET" className="aim-users-filters">
        <div className="aim-filter-group">
          <input
            name="email"
            type="text"
            placeholder="Search by email…"
            defaultValue={email ?? ''}
            className="aim-filter-input aim-filter-input--email"
          />
          <select name="status" defaultValue={status ?? ''} className="aim-filter-select">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="userType" defaultValue={userType ?? ''} className="aim-filter-select">
            <option value="">All types</option>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="hidden" name="limit" value={limit} />
          <button type="submit" className="aim-filter-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Filter
          </button>
          {(status || userType || email) && (
            <Link href={`/admin/users?limit=${limit}`} className="aim-filter-clear-btn">Clear</Link>
          )}
        </div>
      </form>

      {/* Error */}
      {fetchError && (
        <div className="admin-error-banner" role="alert">{fetchError}</div>
      )}

      {/* Empty */}
      {data && data.users.length === 0 && !fetchError && (
        <div className="aim-users-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
          <p className="aim-users-empty-title">No users found</p>
          <p className="aim-users-empty-desc">
            {status || userType || email ? 'Try adjusting the filters above.' : 'No users have been created yet.'}
          </p>
        </div>
      )}

      {/* User Cards */}
      {data && data.users.length > 0 && (
        <>
          <div className="aim-users-grid">
            {data.users.map((user) => (
              <Link key={user.id} href={`/admin/users/${user.id}`} className="aim-user-card">
                <div className="aim-user-card-top">
                  <div className="aim-user-avatar" data-type={user.userType}>
                    {(user.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="aim-user-card-info">
                    <p className="aim-user-email">{user.email ?? 'No email'}</p>
                    <p className="aim-user-id">{user.id.slice(0, 8)}…</p>
                  </div>
                </div>
                <div className="aim-user-card-bottom">
                  <span className={`aim-user-type-badge aim-user-type-badge--${user.userType}`}>
                    {user.userType}
                  </span>
                  <span className={`aim-user-status-dot aim-user-status-dot--${user.status}`} />
                  <span className="aim-user-status-text">{user.status}</span>
                  <span className="aim-user-date">{formatShortDate(user.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="aim-users-pagination" aria-label="User list pagination">
              {page > 1 && (
                <Link href={buildHref(page - 1, { limit, status, userType, email })} className="aim-page-btn">← Previous</Link>
              )}
              <span className="aim-page-info">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={buildHref(page + 1, { limit, status, userType, email })} className="aim-page-btn">Next →</Link>
              )}
            </nav>
          )}
        </>
      )}

      <style>{`
        .aim-users-page { display: flex; flex-direction: column; gap: 20px; }
        .aim-users-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .aim-users-header-left { display: flex; flex-direction: column; gap: 2px; }
        .aim-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .aim-users-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .aim-users-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .aim-users-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .aim-stat-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
        }
        .aim-stat-pill--active { background: color-mix(in srgb, var(--color-success-500) 12%, transparent); color: var(--color-success-600); }
        .aim-stat-pill--pending { background: color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent); color: var(--color-warning-600, #d97706); }
        .aim-stat-pill--disabled { background: color-mix(in srgb, var(--color-error-500) 12%, transparent); color: var(--color-error-600); }

        .aim-users-filters { margin: 0; }
        .aim-filter-group {
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        .aim-filter-input, .aim-filter-select {
          height: 38px; padding: 0 12px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit;
        }
        .aim-filter-input--email { min-width: 200px; flex: 1; max-width: 280px; }
        .aim-filter-select { min-width: 130px; }
        .aim-filter-input:focus, .aim-filter-select:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
        }
        .aim-filter-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px;
          padding: 0 16px; border: none; border-radius: var(--radius-sm);
          background: var(--color-primary-600); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .aim-filter-btn:hover { background: var(--color-primary-700); }
        .aim-filter-clear-btn {
          font-size: 13px; color: var(--text-link); text-decoration: none; padding: 0 8px;
        }
        .aim-filter-clear-btn:hover { text-decoration: underline; }

        .aim-users-empty {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 60px 20px; text-align: center;
        }
        .aim-users-empty-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .aim-users-empty-desc { margin: 0; font-size: 14px; color: var(--text-muted); }

        .aim-users-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;
        }
        .aim-user-card {
          display: flex; flex-direction: column; gap: 12px;
          padding: 16px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); text-decoration: none; color: inherit;
          transition: all 0.15s ease;
        }
        .aim-user-card:hover {
          border-color: var(--color-primary-300, var(--color-primary-500));
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .aim-user-card-top { display: flex; gap: 12px; align-items: center; }
        .aim-user-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .aim-user-avatar[data-type="admin"] { background: var(--color-primary-500); }
        .aim-user-avatar[data-type="super_admin"] { background: #7c3aed; }
        .aim-user-avatar[data-type="student"] { background: #0891b2; }
        .aim-user-avatar[data-type="reviewer"] { background: #0d9488; }
        .aim-user-avatar[data-type="support"] { background: #ea580c; }
        .aim-user-avatar[data-type="system"] { background: #64748b; }
        .aim-user-card-info { min-width: 0; flex: 1; }
        .aim-user-email { margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .aim-user-id { margin: 0; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono, monospace); }
        .aim-user-card-bottom {
          display: flex; align-items: center; gap: 8px; font-size: 12px;
        }
        .aim-user-type-badge {
          padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.03em;
        }
        .aim-user-type-badge--student { background: #e0f2fe; color: #0369a1; }
        .aim-user-type-badge--admin { background: #ede9fe; color: #6d28d9; }
        .aim-user-type-badge--super_admin { background: #fce7f3; color: #be185d; }
        .aim-user-type-badge--reviewer { background: #d1fae5; color: #065f46; }
        .aim-user-type-badge--support { background: #fff7ed; color: #c2410c; }
        .aim-user-type-badge--system { background: #f1f5f9; color: #475569; }
        .aim-user-status-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .aim-user-status-dot--active { background: var(--color-success-500); }
        .aim-user-status-dot--pending { background: var(--color-warning-500, #f59e0b); }
        .aim-user-status-dot--disabled { background: var(--color-error-500); }
        .aim-user-status-dot--deleted { background: var(--text-muted); }
        .aim-user-status-text { color: var(--text-secondary); }
        .aim-user-date { margin-left: auto; color: var(--text-muted); }

        .aim-users-pagination {
          display: flex; align-items: center; justify-content: center; gap: 16px; padding: 8px 0;
        }
        .aim-page-btn {
          font-size: 13px; font-weight: 600; color: var(--color-primary-500);
          text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm);
        }
        .aim-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .aim-page-info { font-size: 13px; color: var(--text-secondary); }

        @media (max-width: 640px) {
          .aim-users-grid { grid-template-columns: 1fr; }
          .aim-filter-group { flex-direction: column; }
          .aim-filter-input--email { max-width: none; }
        }
      `}</style>
    </section>
  );
}

function buildHref(
  page: number,
  params: { limit: number; status?: string; userType?: string; email?: string },
): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.userType) qs.set('userType', params.userType);
  if (params.email) qs.set('email', params.email);
  return `/admin/users?${qs.toString()}`;
}

function formatShortDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
