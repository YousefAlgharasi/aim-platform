'use client';

import { useState, useCallback } from 'react';

import { backendFetch } from '../../lib/api/client-api-helpers';

type PaymentFilter = 'all' | 'succeeded' | 'pending' | 'failed' | 'refunded';

const FILTERS: { key: PaymentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

type Payment = {
  readonly id: string;
  readonly userId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly providerPaymentId: string | null;
  readonly createdAt: string;
};

export function AdminPaymentsView() {
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchPayments = useCallback(async (userId: string) => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch(`/admin/billing/payments/${userId.trim()}`);
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = filter === 'all' ? items : items.filter((p) => p.status === filter);

  return (
    <section className="admin-payments-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Payments</h1>
      <p className="hero-copy">Enter a user ID to load their payment records.</p>

      <div className="admin-payments-view__controls">
        <form onSubmit={(e) => { e.preventDefault(); fetchPayments(searchQuery); }} style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
          <input type="text" className="admin-payments-view__search" placeholder="Enter user ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" style={{ padding: '0 var(--space-16)', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-500)', color: 'var(--text-on-primary)', cursor: 'pointer', fontSize: 14 }}>Search</button>
        </form>
        <div className="admin-payments-view__filters">
          {FILTERS.map((f) => (
            <button key={f.key} className={`admin-payments-view__filter ${filter === f.key ? 'admin-payments-view__filter--active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '1rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-error-700)', fontSize: 13, marginBottom: 'var(--space-16)' }}>{error}</div>}

      <table className="admin-payments-view__table">
        <thead><tr><th>Payment ID</th><th>User ID</th><th>Amount</th><th>Currency</th><th>Status</th><th>Provider Ref</th><th>Created</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>}
          {!loading && !searched && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Enter a user ID above to search for payments.</td></tr>}
          {!loading && searched && filtered.length === 0 && !error && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payments found.</td></tr>}
          {!loading && filtered.map((p) => (
            <tr key={p.id}>
              <td><code style={{ fontSize: 12 }}>{p.id.slice(0, 8)}...</code></td>
              <td><code style={{ fontSize: 12 }}>{p.userId.slice(0, 8)}...</code></td>
              <td>{p.amount}</td>
              <td>{p.currency}</td>
              <td>{p.status}</td>
              <td>{p.providerPaymentId ?? '—'}</td>
              <td>{p.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="boundary-note">
        <h2>Admin payment rules</h2>
        <ul>
          <li>Read-only — no payment mutations from admin UI.</li>
          <li>No raw card data displayed — only safe metadata from backend.</li>
          <li>Refunds initiated through separate admin refund workflow.</li>
          <li>Backend admin role required — enforced by PermissionGuard.</li>
        </ul>
      </div>
    </section>
  );
}
