'use client';

import { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../lib/api/client-api-helpers';

type SubscriptionFilter = 'all' | 'active' | 'cancelled' | 'past_due' | 'trialing';

const FILTERS: { key: SubscriptionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'trialing', label: 'Trialing' },
  { key: 'past_due', label: 'Past Due' },
  { key: 'cancelled', label: 'Cancelled' },
];

type Subscription = {
  readonly id: string;
  readonly userId: string;
  readonly planId: string;
  readonly status: string;
  readonly currentPeriodStart: string | null;
  readonly currentPeriodEnd: string | null;
  readonly createdAt: string;
};

export function AdminSubscriptionsView() {
  const [filter, setFilter] = useState<SubscriptionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchSubs = useCallback(async (userId: string) => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch(`/admin/billing/subscriptions/${userId.trim()}`);
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setItems(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = filter === 'all' ? items : items.filter((s) => s.status === filter);

  return (
    <section className="admin-subscriptions-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Subscriptions</h1>
      <p className="hero-copy">
        Read-only subscription management. Enter a user ID to load their subscriptions.
      </p>

      <div className="admin-subscriptions-view__controls">
        <form onSubmit={(e) => { e.preventDefault(); fetchSubs(searchQuery); }} style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
          <input
            type="text"
            className="admin-subscriptions-view__search"
            placeholder="Enter user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={{ padding: '0 var(--space-16)', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-500)', color: 'var(--text-on-primary)', cursor: 'pointer', fontSize: 14 }}>
            Search
          </button>
        </form>
        <div className="admin-subscriptions-view__filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`admin-subscriptions-view__filter ${filter === f.key ? 'admin-subscriptions-view__filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-error-700)', fontSize: 13, marginBottom: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <table className="admin-subscriptions-view__table">
        <thead>
          <tr>
            <th>Subscription ID</th>
            <th>User ID</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Period Start</th>
            <th>Period End</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
          )}
          {!loading && !searched && !error && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Enter a user ID above to search for subscriptions.</td></tr>
          )}
          {!loading && searched && filtered.length === 0 && !error && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No subscriptions found.</td></tr>
          )}
          {!loading && filtered.map((s) => (
            <tr key={s.id}>
              <td><code style={{ fontSize: 12 }}>{s.id.slice(0, 8)}...</code></td>
              <td><code style={{ fontSize: 12 }}>{s.userId.slice(0, 8)}...</code></td>
              <td>{s.planId}</td>
              <td>{s.status}</td>
              <td>{s.currentPeriodStart ?? '—'}</td>
              <td>{s.currentPeriodEnd ?? '—'}</td>
              <td>{s.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="boundary-note">
        <h2>Admin subscription rules</h2>
        <ul>
          <li>Read-only — no subscription mutations from admin UI.</li>
          <li>Backend admin role required — enforced by PermissionGuard + BillingAdminOnly.</li>
          <li>No raw card data or provider secrets displayed.</li>
          <li>Subscription lifecycle managed by provider webhooks and backend services.</li>
        </ul>
      </div>
    </section>
  );
}
