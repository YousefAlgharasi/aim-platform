'use client';

import { useState, useCallback } from 'react';

import { backendFetch } from '../../lib/api/client-api-helpers';

type RefundFilter = 'all' | 'pending' | 'succeeded' | 'failed' | 'canceled' | 'denied';

const FILTERS: { key: RefundFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'failed', label: 'Failed' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'denied', label: 'Denied' },
];

type Refund = {
  readonly id: string;
  readonly paymentId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly reason: string | null;
  readonly createdAt: string;
};

export function AdminRefundsView() {
  const [filter, setFilter] = useState<RefundFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchRefunds = useCallback(async (paymentId: string) => {
    if (!paymentId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch(`/admin/billing/refunds/${paymentId.trim()}`);
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load refunds.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = filter === 'all' ? items : items.filter((r) => r.status === filter);

  return (
    <section className="admin-refunds-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Refunds</h1>
      <p className="hero-copy">Enter a payment ID to load its refunds.</p>

      <div className="admin-refunds-view__controls">
        <form onSubmit={(e) => { e.preventDefault(); fetchRefunds(searchQuery); }} style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
          <input type="text" className="admin-refunds-view__search" placeholder="Enter payment ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" style={{ padding: '0 var(--space-16)', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-500)', color: 'var(--text-on-primary)', cursor: 'pointer', fontSize: 14 }}>Search</button>
        </form>
        <div className="admin-refunds-view__filters">
          {FILTERS.map((f) => (
            <button key={f.key} className={`admin-refunds-view__filter ${filter === f.key ? 'admin-refunds-view__filter--active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '1rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-error-700)', fontSize: 13, marginBottom: 'var(--space-16)' }}>{error}</div>}

      <table className="admin-refunds-view__table">
        <thead><tr><th>Refund ID</th><th>Payment ID</th><th>Amount</th><th>Currency</th><th>Status</th><th>Reason</th><th>Created</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>}
          {!loading && !searched && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Enter a payment ID above to search for refunds.</td></tr>}
          {!loading && searched && filtered.length === 0 && !error && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No refunds found.</td></tr>}
          {!loading && filtered.map((r) => (
            <tr key={r.id}>
              <td><code style={{ fontSize: 12 }}>{r.id.slice(0, 8)}...</code></td>
              <td><code style={{ fontSize: 12 }}>{r.paymentId.slice(0, 8)}...</code></td>
              <td>{r.amount}</td>
              <td>{r.currency}</td>
              <td>{r.status}</td>
              <td>{r.reason ?? '—'}</td>
              <td>{r.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
