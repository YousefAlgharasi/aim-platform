'use client';

import { useEffect, useState } from 'react';
import { backendFetchJson } from '../../../../core/api/client-api-helpers';
import {
  AdminTable,
  AdminStatusBadge,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../shared/components/Misc';

type Subscription = {
  id: string;
  userId: string;
  studentName: string | null;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

type SubscriptionListData = {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
};

export default function AdminSubscriptionsPage() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    backendFetchJson<SubscriptionListData>('/admin/billing/subscriptions')
      .then((data) => {
        if (cancelled) return;
        setItems(data.data ?? []);
        setTotal(data.total ?? (data.data ?? []).length);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: AdminTableColumn<Subscription>[] = [
    {
      key: 'id',
      header: 'Subscription ID',
      render: (s) => <AdminIdCell id={s.id} />,
    },
    {
      key: 'studentName',
      header: 'Student',
      render: (s) => (s.studentName ? <span>{s.studentName}</span> : <AdminIdCell id={s.userId} />),
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscriptions</h1>
        {!loading && !error && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {total} subscription{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          Loading subscriptions...
        </div>
      ) : !error && items.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          No subscriptions found.
        </div>
      ) : (
        !error && <AdminTable columns={columns} rows={items} getRowKey={(s) => s.id} />
      )}
    </div>
  );
}
