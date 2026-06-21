'use client';

import { useState } from 'react';

type RefundFilter = 'all' | 'pending' | 'succeeded' | 'failed' | 'canceled' | 'denied';

const FILTERS: { key: RefundFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'failed', label: 'Failed' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'denied', label: 'Denied' },
];

export function AdminRefundsView() {
  const [filter, setFilter] = useState<RefundFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="admin-refunds-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Refunds</h1>
      <p className="hero-copy">
        Read-only refund inspection. All data from GET /admin/billing/refunds.
      </p>

      <div className="admin-refunds-view__controls">
        <div className="admin-refunds-view__filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`admin-refunds-view__filter ${filter === f.key ? 'admin-refunds-view__filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="admin-refunds-view__search"
          placeholder="Search by refund ID or payment ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="admin-refunds-view__table">
        <thead>
          <tr>
            <th>Refund ID</th>
            <th>Payment ID</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Requested By</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading refunds from backend...
            </td>
          </tr>
        </tbody>
      </table>

      <div className="boundary-note">
        <h2>Admin refund rules</h2>
        <ul>
          <li>Read-only — refund status is decided by backend/provider, never by this UI.</li>
          <li>
            Controlled refund actions (approve/deny) are exposed only when the backend exposes a
            protected refund-action endpoint; until then the Action column is disabled.
          </li>
          <li>No raw card data or provider secrets displayed.</li>
          <li>Backend admin role required — enforced by PermissionGuard + BillingAdminOnly.</li>
        </ul>
      </div>
    </section>
  );
}
