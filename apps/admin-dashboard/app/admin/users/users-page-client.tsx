'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { backendFetch } from '../../../lib/api/client-api-helpers';
import { AddAdminModal } from './add-admin-modal';

type User = {
  id: string;
  email: string | null;
  phone: string | null;
  userType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type UsersPageClientProps = {
  initialUsers: User[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialEmail?: string;
  initialStatus?: string;
  initialUserType?: string;
};

const STATUS_OPTIONS = ['active', 'pending', 'disabled', 'deleted'];
const TYPE_OPTIONS = ['student', 'admin', 'reviewer', 'support', 'system'];

const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  active: { bg: 'color-mix(in srgb, var(--color-success-500) 12%, transparent)', fg: 'var(--color-success-600)', dot: 'var(--color-success-500)' },
  pending: { bg: 'color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent)', fg: 'var(--color-warning-600, #d97706)', dot: 'var(--color-warning-500, #f59e0b)' },
  disabled: { bg: 'color-mix(in srgb, var(--color-error-500) 12%, transparent)', fg: 'var(--color-error-600)', dot: 'var(--color-error-500)' },
  deleted: { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', dot: 'var(--text-muted)' },
};

const TYPE_BADGE: Record<string, { bg: string; fg: string }> = {
  student: { bg: '#e0f2fe', fg: '#0369a1' },
  admin: { bg: '#ede9fe', fg: '#6d28d9' },
  super_admin: { bg: '#fce7f3', fg: '#be185d' },
  reviewer: { bg: '#d1fae5', fg: '#065f46' },
  support: { bg: '#fff7ed', fg: '#c2410c' },
  system: { bg: '#f1f5f9', fg: '#475569' },
};

export function UsersPageClient({
  initialUsers,
  initialTotal,
  initialPage,
  initialLimit,
  initialEmail,
  initialStatus,
  initialUserType,
}: UsersPageClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [emailQuery, setEmailQuery] = useState(initialEmail ?? '');
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [typeFilter, setTypeFilter] = useState(initialUserType ?? '');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchUsers = useCallback(async (email: string, status: string, userType: string, pg: number) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(pg));
      qs.set('limit', String(limit));
      if (email) qs.set('email', email);
      if (status) qs.set('status', status);
      if (userType) qs.set('userType', userType);

      const res = await backendFetch(`/admin/users?${qs.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const data = json?.data ?? json;
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
        setPage(data.page ?? pg);
      }
    } catch {
      // keep current data
    } finally {
      setLoading(false);
    }
  }, [limit]);

  function handleEmailChange(value: string) {
    setEmailQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(value, statusFilter, typeFilter, 1);
    }, 300);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
    fetchUsers(emailQuery, value, typeFilter, 1);
  }

  function handleTypeChange(value: string) {
    setTypeFilter(value);
    setPage(1);
    fetchUsers(emailQuery, statusFilter, value, 1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchUsers(emailQuery, statusFilter, typeFilter, newPage);
  }

  function clearFilters() {
    setEmailQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
    fetchUsers('', '', '', 1);
  }

  const totalPages = Math.ceil(total / limit);
  const hasFilters = emailQuery || statusFilter || typeFilter;

  const statusCounts = {
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
    disabled: users.filter((u) => u.status === 'disabled').length,
  };

  return (
    <>
      {/* Header */}
      <div className="aim-uh">
        <div className="aim-uh-left">
          <p className="aim-uh-eyebrow">User Management</p>
          <h1 className="aim-uh-title">Users</h1>
          <p className="aim-uh-sub">{total} user{total !== 1 ? 's' : ''} total</p>
        </div>
        <button type="button" className="aim-add-admin-btn" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M16 7a4 4 0 00-8 0M19 8v6M22 11h-6" /></svg>
          Add Admin
        </button>
      </div>

      {/* Stats pills */}
      <div className="aim-us-stats">
        <div className="aim-sp aim-sp--active">
          <span className="aim-sp-dot" style={{ background: 'var(--color-success-500)' }} />
          {statusCounts.active} Active
        </div>
        <div className="aim-sp aim-sp--pending">
          <span className="aim-sp-dot" style={{ background: 'var(--color-warning-500, #f59e0b)' }} />
          {statusCounts.pending} Pending
        </div>
        <div className="aim-sp aim-sp--disabled">
          <span className="aim-sp-dot" style={{ background: 'var(--color-error-500)' }} />
          {statusCounts.disabled} Disabled
        </div>
      </div>

      {/* Live search + filters */}
      <div className="aim-uf">
        <div className="aim-uf-search">
          <svg className="aim-uf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text"
            value={emailQuery}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Search by email…"
            className="aim-uf-input"
          />
          {emailQuery && (
            <button type="button" className="aim-uf-clear-x" onClick={() => handleEmailChange('')} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          {loading && <span className="aim-uf-spinner" />}
        </div>
        <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} className="aim-uf-select">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)} className="aim-uf-select">
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="aim-uf-clear">Clear all</button>
        )}
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="aim-ut-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
          <p style={{ margin: 0, fontWeight: 600 }}>No users found</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {hasFilters ? 'Try adjusting your search or filters.' : 'No users have been created yet.'}
          </p>
        </div>
      ) : (
        <div className="aim-ut-wrap">
          <table className="aim-ut">
            <thead>
              <tr>
                <th className="aim-ut-th">User</th>
                <th className="aim-ut-th aim-ut-th--type">Type</th>
                <th className="aim-ut-th aim-ut-th--status">Status</th>
                <th className="aim-ut-th aim-ut-th--date">Created</th>
                <th className="aim-ut-th aim-ut-th--action" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const tb = TYPE_BADGE[user.userType] ?? TYPE_BADGE.system;
                const sc = STATUS_COLORS[user.status] ?? STATUS_COLORS.active;
                return (
                  <tr
                    key={user.id}
                    className="aim-ut-row"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <td className="aim-ut-td">
                      <div className="aim-ut-user">
                        <div className="aim-ut-avatar" style={{ background: tb.bg, color: tb.fg }}>
                          {(user.email ?? '?')[0].toUpperCase()}
                        </div>
                        <div className="aim-ut-user-info">
                          <span className="aim-ut-email">{user.email ?? 'No email'}</span>
                          <span className="aim-ut-id">{user.id.slice(0, 8)}…</span>
                        </div>
                      </div>
                    </td>
                    <td className="aim-ut-td">
                      <span className="aim-ut-type" style={{ background: tb.bg, color: tb.fg }}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="aim-ut-td">
                      <span className="aim-ut-status" style={{ background: sc.bg, color: sc.fg }}>
                        <span className="aim-ut-status-dot" style={{ background: sc.dot }} />
                        {user.status}
                      </span>
                    </td>
                    <td className="aim-ut-td aim-ut-td--date">{formatDate(user.createdAt)}</td>
                    <td className="aim-ut-td aim-ut-td--action">
                      <Link href={`/admin/users/${user.id}`} className="aim-ut-view" onClick={(e) => e.stopPropagation()}>
                        View
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="aim-up" aria-label="User list pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="aim-up-btn"
          >
            ← Previous
          </button>
          <span className="aim-up-info">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="aim-up-btn"
          >
            Next →
          </button>
        </nav>
      )}

      <AddAdminModal open={showModal} onClose={() => { setShowModal(false); fetchUsers(emailQuery, statusFilter, typeFilter, page); }} />

      <style>{`
        .aim-uh { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .aim-uh-left { display: flex; flex-direction: column; gap: 2px; }
        .aim-uh-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .aim-uh-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .aim-uh-sub { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .aim-add-admin-btn {
          display: inline-flex; align-items: center; gap: 8px; height: 40px;
          padding: 0 20px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .aim-add-admin-btn:hover { background: var(--color-primary-600); }

        .aim-us-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .aim-sp {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
        }
        .aim-sp--active { background: color-mix(in srgb, var(--color-success-500) 12%, transparent); color: var(--color-success-600); }
        .aim-sp--pending { background: color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent); color: var(--color-warning-600, #d97706); }
        .aim-sp--disabled { background: color-mix(in srgb, var(--color-error-500) 12%, transparent); color: var(--color-error-600); }
        .aim-sp-dot { width: 8px; height: 8px; border-radius: 50%; }

        .aim-uf { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .aim-uf-search {
          position: relative; flex: 1; min-width: 220px; max-width: 340px;
        }
        .aim-uf-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
        }
        .aim-uf-input {
          width: 100%; height: 40px; padding: 0 36px 0 36px;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary);
          font-size: 14px; font-family: inherit;
        }
        .aim-uf-input:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .aim-uf-input::placeholder { color: var(--text-muted); }
        .aim-uf-clear-x {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;
        }
        .aim-uf-clear-x:hover { color: var(--text-primary); }
        .aim-uf-spinner {
          position: absolute; right: 32px; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; border: 2px solid var(--border);
          border-top-color: var(--color-primary-500); border-radius: 50%;
          animation: aim-spin 0.6s linear infinite;
        }
        @keyframes aim-spin { to { transform: translateY(-50%) rotate(360deg); } }
        .aim-uf-select {
          height: 40px; padding: 0 12px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit;
          min-width: 130px;
        }
        .aim-uf-select:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .aim-uf-clear {
          background: none; border: none; font-size: 13px; color: var(--text-link);
          cursor: pointer; font-family: inherit; padding: 0 8px;
        }
        .aim-uf-clear:hover { text-decoration: underline; }

        .aim-ut-empty {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 60px 20px; text-align: center; color: var(--text-primary);
        }

        .aim-ut-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .aim-ut { width: 100%; border-collapse: collapse; }
        .aim-ut-th {
          text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .aim-ut-th--type { width: 110px; }
        .aim-ut-th--status { width: 120px; }
        .aim-ut-th--date { width: 130px; }
        .aim-ut-th--action { width: 80px; }
        .aim-ut-row {
          cursor: pointer; transition: background 0.1s;
        }
        .aim-ut-row:hover { background: var(--state-hover, color-mix(in srgb, var(--color-primary-500) 4%, transparent)); }
        .aim-ut-row:not(:last-child) .aim-ut-td { border-bottom: 1px solid var(--border); }
        .aim-ut-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); }
        .aim-ut-td--date { font-size: 13px; color: var(--text-secondary); }
        .aim-ut-td--action { text-align: right; }

        .aim-ut-user { display: flex; align-items: center; gap: 12px; }
        .aim-ut-avatar {
          width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700;
        }
        .aim-ut-user-info { display: flex; flex-direction: column; min-width: 0; }
        .aim-ut-email {
          font-size: 14px; font-weight: 600; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .aim-ut-id {
          font-size: 11px; color: var(--text-muted);
          font-family: var(--font-mono, monospace);
        }
        .aim-ut-type {
          display: inline-block; padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
        }
        .aim-ut-status {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
        }
        .aim-ut-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .aim-ut-view {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 500; color: var(--color-primary-500);
          text-decoration: none;
        }
        .aim-ut-view:hover { text-decoration: underline; }

        .aim-up {
          display: flex; align-items: center; justify-content: center; gap: 16px; padding: 4px 0;
        }
        .aim-up-btn {
          font-size: 13px; font-weight: 600; color: var(--color-primary-500);
          background: none; border: none; cursor: pointer; padding: 6px 12px;
          border-radius: var(--radius-sm); font-family: inherit;
        }
        .aim-up-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .aim-up-btn:disabled { color: var(--text-muted); cursor: default; }
        .aim-up-info { font-size: 13px; color: var(--text-secondary); }

        @media (max-width: 640px) {
          .aim-uf { flex-direction: column; }
          .aim-uf-search { max-width: none; }
          .aim-ut-th--type, .aim-ut-td:nth-child(2),
          .aim-ut-th--date, .aim-ut-td:nth-child(4) { display: none; }
        }
      `}</style>
    </>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
