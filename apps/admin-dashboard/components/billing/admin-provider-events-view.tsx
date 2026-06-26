'use client';

import { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../lib/api/client-api-helpers';

type ProviderEventFilter = 'all' | 'pending' | 'processed' | 'failed' | 'skipped';

const FILTERS: { key: ProviderEventFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processed', label: 'Processed' },
  { key: 'failed', label: 'Failed' },
  { key: 'skipped', label: 'Skipped' },
];

type ProviderEvent = {
  readonly id: string;
  readonly eventType: string;
  readonly provider: string;
  readonly processingStatus: string;
  readonly errorMessage: string | null;
  readonly processedAt: string | null;
  readonly createdAt: string;
};

export function AdminProviderEventsView() {
  const [filter, setFilter] = useState<ProviderEventFilter>('all');
  const [items, setItems] = useState<ProviderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = status && status !== 'all' ? `?status=${status}` : '';
      const res = await backendFetch(`/admin/billing/provider-events${query}`);
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(filter); }, [fetchEvents, filter]);

  return (
    <section className="admin-provider-events-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Provider Events</h1>
      <p className="hero-copy">Webhook events from payment providers.</p>

      <div className="admin-provider-events-view__controls">
        <div className="admin-provider-events-view__filters">
          {FILTERS.map((f) => (
            <button key={f.key} className={`admin-provider-events-view__filter ${filter === f.key ? 'admin-provider-events-view__filter--active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '1rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-error-700)', fontSize: 13, marginBottom: 'var(--space-16)' }}>{error}<button onClick={() => fetchEvents(filter)} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>Retry</button></div>}

      <table className="admin-provider-events-view__table">
        <thead><tr><th>Event ID</th><th>Type</th><th>Provider</th><th>Status</th><th>Error</th><th>Processed</th><th>Created</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>}
          {!loading && items.length === 0 && !error && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No provider events found.</td></tr>}
          {!loading && items.map((e) => (
            <tr key={e.id}>
              <td><code style={{ fontSize: 12 }}>{e.id.slice(0, 8)}...</code></td>
              <td>{e.eventType}</td>
              <td>{e.provider}</td>
              <td>{e.processingStatus}</td>
              <td>{e.errorMessage ?? '—'}</td>
              <td>{e.processedAt ?? '—'}</td>
              <td>{e.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
