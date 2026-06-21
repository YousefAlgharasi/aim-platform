'use client';

import { useState } from 'react';

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
        {activeTab === 'subscriptions' && <BillingListPanel type="subscriptions" />}
        {activeTab === 'payments' && <BillingListPanel type="payments" />}
        {activeTab === 'invoices' && <BillingListPanel type="invoices" />}
        {activeTab === 'events' && <BillingListPanel type="provider-events" />}
        {activeTab === 'audit' && <BillingListPanel type="audit-logs" />}
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

function BillingListPanel({ type }: { readonly type: string }) {
  return (
    <div className="admin-billing-monitor__panel">
      <h2>{type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h2>
      <p>Data will be loaded from GET /admin/billing/{type}.</p>
      <table className="admin-billing-monitor__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Created</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
