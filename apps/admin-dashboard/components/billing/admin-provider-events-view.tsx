'use client';

import { useState } from 'react';

type ProviderEventFilter = 'all' | 'pending' | 'processed' | 'failed' | 'skipped';

const FILTERS: { key: ProviderEventFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processed', label: 'Processed' },
  { key: 'failed', label: 'Failed' },
  { key: 'skipped', label: 'Skipped' },
];

export function AdminProviderEventsView() {
  const [filter, setFilter] = useState<ProviderEventFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="admin-provider-events-view">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Provider Events</h1>
      <p className="hero-copy">
        Read-only webhook/provider event audit trail. All data from GET
        /admin/billing/provider-events.
      </p>

      <div className="admin-provider-events-view__controls">
        <div className="admin-provider-events-view__filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`admin-provider-events-view__filter ${filter === f.key ? 'admin-provider-events-view__filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="admin-provider-events-view__search"
          placeholder="Search by event ID or idempotency key..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="admin-provider-events-view__table">
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Provider</th>
            <th>Event Type</th>
            <th>Processing Status</th>
            <th>Idempotency Key</th>
            <th>Processed At</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
              Loading provider events from backend...
            </td>
          </tr>
        </tbody>
      </table>

      <div className="boundary-note">
        <h2>Admin provider event rules</h2>
        <ul>
          <li>Read-only — provider event validity is decided by backend signature verification.</li>
          <li>Only safe metadata is shown — no raw provider payloads or signing secrets.</li>
          <li>Idempotency key is displayed for traceability, never editable.</li>
          <li>Backend admin role required — enforced by PermissionGuard + BillingAdminOnly.</li>
        </ul>
      </div>
    </section>
  );
}
