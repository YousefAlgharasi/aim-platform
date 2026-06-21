'use client';

import { useState } from 'react';

type PaymentFilter = 'all' | 'succeeded' | 'pending' | 'failed' | 'refunded';

const FILTERS: { key: PaymentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

export function AdminPaymentsView() {
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="admin-payments-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Payments</h1>
      <p className="hero-copy">
        Read-only payment records. All data from GET /admin/billing/payments.
      </p>

      <div className="admin-payments-view__controls">
        <div className="admin-payments-view__filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`admin-payments-view__filter ${filter === f.key ? 'admin-payments-view__filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="admin-payments-view__search"
          placeholder="Search by payment ID or user ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="admin-payments-view__table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Provider Ref</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading payments from backend...
            </td>
          </tr>
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
