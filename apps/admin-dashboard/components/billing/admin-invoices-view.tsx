'use client';

import { useState, useCallback } from 'react';

import { backendFetch } from '../../lib/api/client-api-helpers';

type InvoiceFilter = 'all' | 'paid' | 'pending' | 'failed' | 'void';

const FILTERS: { key: InvoiceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'void', label: 'Void' },
];

type Invoice = {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly total: number;
  readonly currency: string;
  readonly dueDate: string | null;
  readonly paidAt: string | null;
  readonly createdAt: string;
};

export function AdminInvoicesView() {
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchInvoices = useCallback(async (userId: string) => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch(`/admin/billing/invoices/${userId.trim()}`);
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = filter === 'all' ? items : items.filter((inv) => inv.status === filter);

  return (
    <section className="admin-invoices-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Invoices</h1>
      <p className="hero-copy">Enter a user ID to load their invoices.</p>

      <div className="admin-invoices-view__controls">
        <form onSubmit={(e) => { e.preventDefault(); fetchInvoices(searchQuery); }} style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
          <input type="text" className="admin-invoices-view__search" placeholder="Enter user ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" style={{ padding: '0 var(--space-16)', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-500)', color: 'var(--text-on-primary)', cursor: 'pointer', fontSize: 14 }}>Search</button>
        </form>
        <div className="admin-invoices-view__filters">
          {FILTERS.map((f) => (
            <button key={f.key} className={`admin-invoices-view__filter ${filter === f.key ? 'admin-invoices-view__filter--active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '1rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-error-700)', fontSize: 13, marginBottom: 'var(--space-16)' }}>{error}</div>}

      <table className="admin-invoices-view__table">
        <thead><tr><th>Invoice ID</th><th>User ID</th><th>Total</th><th>Currency</th><th>Status</th><th>Due Date</th><th>Paid At</th><th>Created</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>}
          {!loading && !searched && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Enter a user ID above to search for invoices.</td></tr>}
          {!loading && searched && filtered.length === 0 && !error && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No invoices found.</td></tr>}
          {!loading && filtered.map((inv) => (
            <tr key={inv.id}>
              <td><code style={{ fontSize: 12 }}>{inv.id.slice(0, 8)}...</code></td>
              <td><code style={{ fontSize: 12 }}>{inv.userId.slice(0, 8)}...</code></td>
              <td>{inv.total}</td>
              <td>{inv.currency}</td>
              <td>{inv.status}</td>
              <td>{inv.dueDate ?? '—'}</td>
              <td>{inv.paidAt ?? '—'}</td>
              <td>{inv.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
