'use client';

import { useState } from 'react';
import { backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  active: 'var(--color-success-500)',
  trialing: 'var(--color-primary-500)',
  past_due: 'var(--color-warning-500, #f59e0b)',
  canceled: 'var(--color-error-500)',
  expired: 'var(--text-muted)',
  paused: 'var(--text-muted)',
};

export default function AdminSubscriptionsPage() {
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await backendFetchJson<Subscription[]>(`/admin/billing/subscriptions/${userId.trim()}`);
      setItems(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bs-page">
      <div className="bs-header">
        <div>
          <p className="bs-eyebrow">Billing</p>
          <h1 className="bs-title">Subscriptions</h1>
          <p className="bs-subtitle">Look up subscriptions by user ID.</p>
        </div>
      </div>

      <div className="bs-search-card">
        <form onSubmit={handleSearch} className="bs-search-form">
          <div className="bs-field bs-field--grow">
            <label htmlFor="bs-uid" className="bs-label">User ID</label>
            <input id="bs-uid" type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID" disabled={loading} className="bs-input" />
          </div>
          <button type="submit" disabled={loading || !userId.trim()} className="bs-submit">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {searched && !error && items.length === 0 && (
        <div className="bs-empty">
          <p className="bs-empty-title">No subscriptions found</p>
          <p className="bs-empty-desc">This user has no subscriptions.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="bs-table-wrap">
          <table className="bs-table">
            <thead>
              <tr>
                <th className="bs-th">Subscription ID</th>
                <th className="bs-th bs-th--plan">Plan</th>
                <th className="bs-th bs-th--status">Status</th>
                <th className="bs-th bs-th--date">Period Start</th>
                <th className="bs-th bs-th--date">Period End</th>
                <th className="bs-th bs-th--date">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="bs-row">
                  <td className="bs-td"><code className="bs-id">{s.id.slice(0, 12)}…</code></td>
                  <td className="bs-td bs-td--plan"><code className="bs-id">{s.planId.slice(0, 8)}…</code></td>
                  <td className="bs-td">
                    <span className="bs-status">
                      <span className="bs-status-dot" style={{ background: STATUS_DOT[s.status] ?? 'var(--text-muted)' }} />
                      {s.status}
                    </span>
                  </td>
                  <td className="bs-td bs-td--date">{fmtDate(s.currentPeriodStart)}</td>
                  <td className="bs-td bs-td--date">{fmtDate(s.currentPeriodEnd)}</td>
                  <td className="bs-td bs-td--date">{fmtDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searched && !error && (
        <div className="bs-empty">
          <p className="bs-empty-title">Search for subscriptions</p>
          <p className="bs-empty-desc">Enter a user ID above to view their subscriptions.</p>
        </div>
      )}

      <style>{`
        .bs-page { display: flex; flex-direction: column; gap: 20px; }
        .bs-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .bs-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .bs-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .bs-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .bs-search-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 20px;
        }
        .bs-search-form { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .bs-field { display: flex; flex-direction: column; gap: 4px; }
        .bs-field--grow { flex: 1; min-width: 200px; }
        .bs-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .bs-input {
          height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit;
        }
        .bs-input:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .bs-submit {
          height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap;
        }
        .bs-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .bs-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .bs-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .bs-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .bs-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .bs-th--plan { width: 100px; }
        .bs-th--status { width: 110px; }
        .bs-th--date { width: 100px; }
        .bs-row { transition: background 0.1s; }
        .bs-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .bs-row:not(:last-child) .bs-td { border-bottom: 1px solid var(--border); }
        .bs-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .bs-td--plan { font-size: 12px; }
        .bs-td--date { font-size: 12px; color: var(--text-secondary); }
        .bs-id {
          font-family: monospace; font-size: 11px; padding: 2px 6px;
          background: var(--surface-sunken); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-secondary);
        }
        .bs-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .bs-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .bs-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .bs-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .bs-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .bs-search-form { flex-direction: column; align-items: stretch; }
          .bs-th--date, .bs-td--date { display: none; }
        }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '--'; }
}
