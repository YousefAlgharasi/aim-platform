'use client';

import { useState } from 'react';
import { backendFetchJson } from '../../../../core/api/client-api-helpers';
import {
  AdminTable,
  AdminStatusBadge,
  AdminInput,
  AdminButton,
  AdminCard,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../shared/components/Misc';

type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

export default function AdminSubscriptionsPage() {
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await backendFetchJson<Subscription[]>(
        `/admin/billing/subscriptions/${userId.trim()}`
      );
      setItems(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }

  const columns: AdminTableColumn<Subscription>[] = [
    {
      key: 'id',
      header: 'Subscription ID',
      render: (s) => <AdminIdCell id={s.id} />,
    },
    {
      key: 'planId',
      header: 'Plan ID',
      render: (s) => <AdminIdCell id={s.planId} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (s) => <AdminStatusBadge status={s.status} />,
    },
    {
      key: 'currentPeriodStart',
      header: 'Period Start',
      width: '130px',
      render: (s) => <AdminDateCell iso={s.currentPeriodStart} />,
    },
    {
      key: 'currentPeriodEnd',
      header: 'Period End',
      width: '130px',
      render: (s) => <AdminDateCell iso={s.currentPeriodEnd} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '130px',
      render: (s) => <AdminDateCell iso={s.createdAt} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-500)]">
          Billing
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscriptions</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Look up subscriptions by user ID.
        </p>
      </div>

      <AdminCard className="p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[240px]">
            <label htmlFor="bs-uid" className="text-xs font-medium text-[var(--text-secondary)]">
              User ID
            </label>
            <AdminInput
              id="bs-uid"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              disabled={loading}
            />
          </div>
          <AdminButton type="submit" variant="primary" disabled={loading || !userId.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </AdminButton>
        </form>
      </AdminCard>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      {searched && !error && items.length === 0 && (
        <AdminCard className="p-8 text-center flex flex-col items-center justify-center gap-1">
          <p className="font-semibold text-sm text-[var(--text-primary)]">No subscriptions found</p>
          <p className="text-xs text-[var(--text-muted)]">This user has no subscriptions.</p>
        </AdminCard>
      )}

      {items.length > 0 && (
        <AdminTable columns={columns} rows={items} getRowKey={(s) => s.id} />
      )}
    </div>
  );
}
