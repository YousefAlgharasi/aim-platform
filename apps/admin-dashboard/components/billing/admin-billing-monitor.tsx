'use client';

import { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../lib/api/client-api-helpers';

type BillingTab = 'overview' | 'subscriptions' | 'payments' | 'invoices' | 'events' | 'audit';

const TABS: { key: BillingTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'payments', label: 'Payments' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'events', label: 'Provider Events' },
  { key: 'audit', label: 'Audit Log' },
];

export function AdminBillingMonitor() {
  const [activeTab, setActiveTab] = useState<BillingTab>('overview');

  return (
    <section className="admin-billing-monitor">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Billing Monitor</h1>
      <p className="hero-copy">
        Read-only billing administration. All data from backend admin endpoints.
      </p>

      <nav className="admin-billing-monitor__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-billing-monitor__tab ${activeTab === tab.key ? 'admin-billing-monitor__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="admin-billing-monitor__content">
        {activeTab === 'overview' && <BillingOverviewPanel />}
        {activeTab === 'events' && <BillingListPanel endpoint="/admin/billing/provider-events?status=pending" type="Provider Events" />}
        {activeTab === 'audit' && <BillingListPanel endpoint="/admin/billing/audit-logs" type="Audit Logs" />}
        {activeTab === 'subscriptions' && <BillingPlaceholderPanel type="Subscriptions" hint="Requires a user ID — use the Users page to view a specific user's subscriptions." />}
        {activeTab === 'payments' && <BillingPlaceholderPanel type="Payments" hint="Requires a user ID — use the Users page to view a specific user's payments." />}
        {activeTab === 'invoices' && <BillingPlaceholderPanel type="Invoices" hint="Requires a user ID — use the Users page to view a specific user's invoices." />}
      </div>

      <div className="boundary-note">
        <h2>Admin billing rules</h2>
        <ul>
          <li>All data from GET /admin/billing/* endpoints — backend is authority.</li>
          <li>Admin role required — enforced by backend PermissionGuard.</li>
          <li>Read-only — no mutation endpoints exposed in this view.</li>
          <li>No raw card data, provider secrets, or webhook secrets displayed.</li>
        </ul>
      </div>
    </section>
  );
}

function BillingOverviewPanel() {
  return (
    <div className="admin-billing-monitor__panel">
      <h2>Billing Overview</h2>
      <p>Summary statistics will be loaded from the backend admin billing API.</p>
      <div className="admin-billing-monitor__stats">
        <StatCard label="Active Subscriptions" value="—" />
        <StatCard label="Revenue (MTD)" value="—" />
        <StatCard label="Pending Refunds" value="—" />
        <StatCard label="Failed Payments" value="—" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="admin-billing-monitor__stat-card">
      <span className="admin-billing-monitor__stat-label">{label}</span>
      <span className="admin-billing-monitor__stat-value">{value}</span>
    </div>
  );
}

type ListRow = Record<string, unknown>;

function BillingListPanel({ endpoint, type }: { readonly endpoint: string; readonly type: string }) {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch(endpoint);
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setRows(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${type}.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, type]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : ['ID', 'Status', 'Created'];

  return (
    <div className="admin-billing-monitor__panel">
      <h2>{type}</h2>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-error-700)', fontSize: 13, marginBottom: 'var(--space-16)' }}>
          {error}
          <button onClick={fetchData} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>Retry</button>
        </div>
      )}

      <table className="admin-billing-monitor__table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
          )}
          {!loading && !error && rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No {type.toLowerCase()} found.</td></tr>
          )}
          {!loading && rows.map((row, i) => (
            <tr key={String(row.id ?? i)}>
              {columns.map((col) => (
                <td key={col}>{row[col] != null ? String(row[col]) : '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BillingPlaceholderPanel({ type, hint }: { readonly type: string; readonly hint: string }) {
  return (
    <div className="admin-billing-monitor__panel">
      <h2>{type}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{hint}</p>
    </div>
  );
}
