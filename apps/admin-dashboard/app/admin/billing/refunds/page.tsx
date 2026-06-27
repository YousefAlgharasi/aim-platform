'use client';

import { useState } from 'react';
import { backendFetch, backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Refund = {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  requestedBy: string;
  approvedBy: string | null;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  pending: 'var(--color-warning-500, #f59e0b)',
  succeeded: 'var(--color-success-500)',
  failed: 'var(--color-error-500)',
  canceled: 'var(--text-muted)',
  denied: 'var(--color-error-500)',
};

export default function AdminRefundsPage() {
  const [paymentId, setPaymentId] = useState('');
  const [items, setItems] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await backendFetchJson<Refund[]>(`/admin/billing/refunds/${paymentId.trim()}`);
      setItems(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load refunds.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(refundId: string, action: 'approve' | 'deny') {
    setActionPending(refundId);
    try {
      const res = await backendFetch(`/admin/billing/manage/refunds/${refundId}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Failed to ${action} refund`);
      setItems((prev) => prev.map((r) =>
        r.id === refundId ? { ...r, status: action === 'approve' ? 'succeeded' : 'denied' } : r
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} refund.`);
    } finally {
      setActionPending(null);
    }
  }

  return (
    <section className="br-page">
      <div className="br-header">
        <div>
          <p className="br-eyebrow">Billing</p>
          <h1 className="br-title">Refunds</h1>
          <p className="br-subtitle">Look up refunds by payment ID. Super admins can approve or deny pending refunds.</p>
        </div>
      </div>

      <div className="br-search-card">
        <form onSubmit={handleSearch} className="br-search-form">
          <div className="br-field br-field--grow">
            <label htmlFor="br-pid" className="br-label">Payment ID</label>
            <input id="br-pid" type="text" value={paymentId} onChange={(e) => setPaymentId(e.target.value)}
              placeholder="Enter payment ID" disabled={loading} className="br-input" />
          </div>
          <button type="submit" disabled={loading || !paymentId.trim()} className="br-submit">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {searched && !error && items.length === 0 && (
        <div className="br-empty"><p className="br-empty-title">No refunds found</p><p className="br-empty-desc">No refunds exist for this payment.</p></div>
      )}

      {items.length > 0 && (
        <div className="br-table-wrap">
          <table className="br-table">
            <thead>
              <tr>
                <th className="br-th">Refund ID</th>
                <th className="br-th br-th--amt">Amount</th>
                <th className="br-th br-th--status">Status</th>
                <th className="br-th br-th--reason">Reason</th>
                <th className="br-th br-th--date">Requested</th>
                <th className="br-th br-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="br-row">
                  <td className="br-td"><code className="br-id">{r.id.slice(0, 12)}…</code></td>
                  <td className="br-td br-td--amt">{r.currency} {(r.amount / 100).toFixed(2)}</td>
                  <td className="br-td">
                    <span className="br-status">
                      <span className="br-status-dot" style={{ background: STATUS_DOT[r.status] ?? 'var(--text-muted)' }} />
                      {r.status}
                    </span>
                  </td>
                  <td className="br-td br-td--reason">{r.reason || '--'}</td>
                  <td className="br-td br-td--date">{fmtDate(r.createdAt)}</td>
                  <td className="br-td br-td--actions">
                    {r.status === 'pending' ? (
                      <div className="br-action-btns">
                        <button className="br-btn br-btn--approve" disabled={actionPending === r.id}
                          onClick={() => handleAction(r.id, 'approve')}>Approve</button>
                        <button className="br-btn br-btn--deny" disabled={actionPending === r.id}
                          onClick={() => handleAction(r.id, 'deny')}>Deny</button>
                      </div>
                    ) : (
                      <span className="br-muted">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searched && !error && (
        <div className="br-empty"><p className="br-empty-title">Search for refunds</p><p className="br-empty-desc">Enter a payment ID above to view its refund requests.</p></div>
      )}

      <style>{`
        .br-page { display: flex; flex-direction: column; gap: 20px; }
        .br-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .br-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .br-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .br-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .br-search-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
        .br-search-form { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .br-field { display: flex; flex-direction: column; gap: 4px; }
        .br-field--grow { flex: 1; min-width: 200px; }
        .br-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .br-input { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }
        .br-input:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .br-submit { height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md); background: var(--color-primary-500); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .br-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .br-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .br-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .br-table { width: 100%; border-collapse: collapse; min-width: 650px; }
        .br-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .br-th--amt { width: 110px; }
        .br-th--status { width: 100px; }
        .br-th--reason { width: 160px; }
        .br-th--date { width: 100px; }
        .br-th--actions { width: 150px; }
        .br-row { transition: background 0.1s; }
        .br-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .br-row:not(:last-child) .br-td { border-bottom: 1px solid var(--border); }
        .br-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .br-td--amt { font-weight: 600; }
        .br-td--reason { font-size: 12px; color: var(--text-secondary); }
        .br-td--date { font-size: 12px; color: var(--text-secondary); }
        .br-td--actions { font-size: 12px; }
        .br-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .br-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .br-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .br-action-btns { display: flex; gap: 6px; }
        .br-btn { padding: 4px 10px; border: none; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; }
        .br-btn--approve { background: var(--color-success-500); color: white; }
        .br-btn--approve:hover:not(:disabled) { opacity: 0.9; }
        .br-btn--deny { background: var(--color-error-500); color: white; }
        .br-btn--deny:hover:not(:disabled) { opacity: 0.9; }
        .br-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .br-muted { color: var(--text-muted); }
        .br-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .br-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .br-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .br-search-form { flex-direction: column; align-items: stretch; } .br-th--reason, .br-td--reason { display: none; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
