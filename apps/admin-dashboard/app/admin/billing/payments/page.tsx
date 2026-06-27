'use client';

import { useState } from 'react';
import { backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Payment = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodType: string | null;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  succeeded: 'var(--color-success-500)',
  pending: 'var(--color-warning-500, #f59e0b)',
  failed: 'var(--color-error-500)',
  refunded: 'var(--text-muted)',
  partially_refunded: 'var(--color-warning-500, #f59e0b)',
};

export default function AdminPaymentsPage() {
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await backendFetchJson<Payment[]>(`/admin/billing/payments/${userId.trim()}`);
      setItems(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bp-page">
      <div className="bp-header">
        <div>
          <p className="bp-eyebrow">Billing</p>
          <h1 className="bp-title">Payments</h1>
          <p className="bp-subtitle">Look up payment history by user ID.</p>
        </div>
      </div>

      <div className="bp-search-card">
        <form onSubmit={handleSearch} className="bp-search-form">
          <div className="bp-field bp-field--grow">
            <label htmlFor="bp-uid" className="bp-label">User ID</label>
            <input id="bp-uid" type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID" disabled={loading} className="bp-input" />
          </div>
          <button type="submit" disabled={loading || !userId.trim()} className="bp-submit">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {searched && !error && items.length === 0 && (
        <div className="bp-empty"><p className="bp-empty-title">No payments found</p><p className="bp-empty-desc">This user has no payment history.</p></div>
      )}

      {items.length > 0 && (
        <div className="bp-table-wrap">
          <table className="bp-table">
            <thead>
              <tr>
                <th className="bp-th">Payment ID</th>
                <th className="bp-th bp-th--amt">Amount</th>
                <th className="bp-th bp-th--status">Status</th>
                <th className="bp-th bp-th--method">Method</th>
                <th className="bp-th bp-th--date">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="bp-row">
                  <td className="bp-td"><code className="bp-id">{p.id.slice(0, 12)}…</code></td>
                  <td className="bp-td bp-td--amt">{p.currency} {(p.amount / 100).toFixed(2)}</td>
                  <td className="bp-td">
                    <span className="bp-status">
                      <span className="bp-status-dot" style={{ background: STATUS_DOT[p.status] ?? 'var(--text-muted)' }} />
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="bp-td bp-td--method">{p.paymentMethodType ?? '--'}</td>
                  <td className="bp-td bp-td--date">{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searched && !error && (
        <div className="bp-empty"><p className="bp-empty-title">Search for payments</p><p className="bp-empty-desc">Enter a user ID above to view their payment history.</p></div>
      )}

      <style>{`
        .bp-page { display: flex; flex-direction: column; gap: 20px; }
        .bp-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .bp-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .bp-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .bp-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .bp-search-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
        .bp-search-form { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .bp-field { display: flex; flex-direction: column; gap: 4px; }
        .bp-field--grow { flex: 1; min-width: 200px; }
        .bp-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .bp-input { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }
        .bp-input:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .bp-submit { height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md); background: var(--color-primary-500); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .bp-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .bp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .bp-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .bp-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .bp-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .bp-th--amt { width: 120px; }
        .bp-th--status { width: 130px; }
        .bp-th--method { width: 100px; }
        .bp-th--date { width: 100px; }
        .bp-row { transition: background 0.1s; }
        .bp-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .bp-row:not(:last-child) .bp-td { border-bottom: 1px solid var(--border); }
        .bp-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .bp-td--amt { font-weight: 600; }
        .bp-td--method { font-size: 12px; color: var(--text-secondary); text-transform: capitalize; }
        .bp-td--date { font-size: 12px; color: var(--text-secondary); }
        .bp-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .bp-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .bp-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .bp-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .bp-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .bp-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .bp-search-form { flex-direction: column; align-items: stretch; } .bp-th--method, .bp-td--method { display: none; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
