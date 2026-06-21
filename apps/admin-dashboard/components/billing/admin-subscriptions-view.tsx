'use client';

import { useState } from 'react';

type SubscriptionFilter = 'all' | 'active' | 'cancelled' | 'past_due' | 'trialing';

const FILTERS: { key: SubscriptionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'trialing', label: 'Trialing' },
  { key: 'past_due', label: 'Past Due' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function AdminSubscriptionsView() {
  const [filter, setFilter] = useState<SubscriptionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="admin-subscriptions-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Subscriptions</h1>
      <p className="hero-copy">
        Read-only subscription management. All data from GET /admin/billing/subscriptions.
      </p>

      <div className="admin-subscriptions-view__controls">
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
        <input
          type="text"
          className="admin-subscriptions-view__search"
          placeholder="Search by user ID or subscription ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading subscriptions from backend...
            </td>
          </tr>
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
