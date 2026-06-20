'use client';

import { useState } from 'react';

type InvoiceFilter = 'all' | 'paid' | 'pending' | 'failed' | 'void';

const FILTERS: { key: InvoiceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'void', label: 'Void' },
];

export function AdminInvoicesView() {
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="admin-invoices-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Invoices</h1>
      <p className="hero-copy">
        Read-only invoice records. All data from GET /admin/billing/invoices.
      </p>

      <div className="admin-invoices-view__controls">
        <div className="admin-invoices-view__filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`admin-invoices-view__filter ${filter === f.key ? 'admin-invoices-view__filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="admin-invoices-view__search"
          placeholder="Search by invoice ID or user ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="admin-invoices-view__table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>User ID</th>
            <th>Subscription</th>
            <th>Total</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading invoices from backend...
            </td>
          </tr>
        </tbody>
      </table>

      <div className="boundary-note">
        <h2>Admin invoice rules</h2>
        <ul>
          <li>Read-only — no invoice mutations from admin UI.</li>
          <li>Invoice lifecycle managed by backend and provider webhooks.</li>
          <li>No raw card data or provider secrets displayed.</li>
          <li>Backend admin role required — enforced by PermissionGuard.</li>
        </ul>
      </div>
    </section>
  );
}
