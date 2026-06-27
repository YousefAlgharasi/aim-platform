'use client';

import { useState } from 'react';
import { backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Invoice = {
  id: string;
  userId: string;
  status: string;
  total: number;
  currency: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  paid: 'var(--color-success-500)',
  open: 'var(--color-primary-500)',
  draft: 'var(--text-muted)',
  void: 'var(--text-muted)',
  uncollectible: 'var(--color-error-500)',
};

export default function AdminInvoicesPage() {
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await backendFetchJson<Invoice[]>(`/admin/billing/invoices/${userId.trim()}`);
      setItems(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bi-page">
      <div className="bi-header">
        <div>
          <p className="bi-eyebrow">Billing</p>
          <h1 className="bi-title">Invoices</h1>
          <p className="bi-subtitle">Look up invoices by user ID.</p>
        </div>
      </div>

      <div className="bi-search-card">
        <form onSubmit={handleSearch} className="bi-search-form">
          <div className="bi-field bi-field--grow">
            <label htmlFor="bi-uid" className="bi-label">User ID</label>
            <input id="bi-uid" type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID" disabled={loading} className="bi-input" />
          </div>
          <button type="submit" disabled={loading || !userId.trim()} className="bi-submit">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {searched && !error && items.length === 0 && (
        <div className="bi-empty"><p className="bi-empty-title">No invoices found</p><p className="bi-empty-desc">This user has no invoices.</p></div>
      )}

      {items.length > 0 && (
        <div className="bi-table-wrap">
          <table className="bi-table">
            <thead>
              <tr>
                <th className="bi-th">Invoice ID</th>
                <th className="bi-th bi-th--amt">Total</th>
                <th className="bi-th bi-th--status">Status</th>
                <th className="bi-th bi-th--date">Due Date</th>
                <th className="bi-th bi-th--date">Paid At</th>
                <th className="bi-th bi-th--date">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} className="bi-row">
                  <td className="bi-td"><code className="bi-id">{inv.id.slice(0, 12)}…</code></td>
                  <td className="bi-td bi-td--amt">{inv.currency} {(inv.total / 100).toFixed(2)}</td>
                  <td className="bi-td">
                    <span className="bi-status">
                      <span className="bi-status-dot" style={{ background: STATUS_DOT[inv.status] ?? 'var(--text-muted)' }} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="bi-td bi-td--date">{fmtDate(inv.dueDate)}</td>
                  <td className="bi-td bi-td--date">{fmtDate(inv.paidAt)}</td>
                  <td className="bi-td bi-td--date">{fmtDate(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searched && !error && (
        <div className="bi-empty"><p className="bi-empty-title">Search for invoices</p><p className="bi-empty-desc">Enter a user ID above to view their invoices.</p></div>
      )}

      <style>{`
        .bi-page { display: flex; flex-direction: column; gap: 20px; }
        .bi-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .bi-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .bi-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .bi-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .bi-search-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
        .bi-search-form { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .bi-field { display: flex; flex-direction: column; gap: 4px; }
        .bi-field--grow { flex: 1; min-width: 200px; }
        .bi-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .bi-input { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }
        .bi-input:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .bi-submit { height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md); background: var(--color-primary-500); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .bi-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .bi-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .bi-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .bi-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .bi-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .bi-th--amt { width: 120px; }
        .bi-th--status { width: 110px; }
        .bi-th--date { width: 100px; }
        .bi-row { transition: background 0.1s; }
        .bi-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .bi-row:not(:last-child) .bi-td { border-bottom: 1px solid var(--border); }
        .bi-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .bi-td--amt { font-weight: 600; }
        .bi-td--date { font-size: 12px; color: var(--text-secondary); }
        .bi-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .bi-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .bi-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .bi-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .bi-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .bi-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .bi-search-form { flex-direction: column; align-items: stretch; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
