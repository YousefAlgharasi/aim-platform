'use client';

import { useState } from 'react';
import { useAdminFetch } from '../../lib/hooks/use-admin-fetch';
import {
  AdminDateCell,
  AdminIdCell,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
} from '../common';
import { AdminErrorBanner } from '../layout';

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

const COLUMNS: readonly AdminTableColumn<ProviderEvent>[] = [
  { key: 'id', header: 'Event ID', render: (e) => <AdminIdCell id={e.id} /> },
  { key: 'eventType', header: 'Type', render: (e) => e.eventType },
  { key: 'provider', header: 'Provider', render: (e) => e.provider },
  { key: 'processingStatus', header: 'Status', render: (e) => <AdminStatusBadge status={e.processingStatus} /> },
  { key: 'errorMessage', header: 'Error', render: (e) => e.errorMessage ?? '—' },
  { key: 'processedAt', header: 'Processed', render: (e) => <AdminDateCell iso={e.processedAt} /> },
  { key: 'createdAt', header: 'Created', render: (e) => <AdminDateCell iso={e.createdAt} /> },
];

export function AdminProviderEventsView() {
  const [filter, setFilter] = useState<ProviderEventFilter>('all');
  const { data: items, loading, error } = useAdminFetch<ProviderEvent>('/admin/billing/provider-events', filter);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-500)]">
          Internal admin surface
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Provider Events</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Webhook events from payment providers.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === f.key
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:bg-[var(--state-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <AdminErrorBanner message={error} />}

      {loading ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          Loading provider events...
        </div>
      ) : items.length === 0 && !error ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          No provider events found.
        </div>
      ) : (
        <AdminTable columns={COLUMNS} rows={items} getRowKey={(e) => e.id} />
      )}
    </section>
  );
}
