'use client';

import { useRouter } from 'next/navigation';
import {
  AdminTable,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
  AdminPagination,
  AdminInput,
  AdminButton,
  AdminCard,
} from '../../../components/common';
import type { AdminTableColumn } from '../../../components/common';
import { useState } from 'react';

type ActivityLogRow = {
  readonly id: string;
  readonly userId: string;
  readonly eventType: string;
  readonly createdAt: string;
};

type Props = {
  readonly logs: readonly ActivityLogRow[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterUserId: string;
  readonly filterEventType: string;
};

const columns: AdminTableColumn<ActivityLogRow>[] = [
  {
    key: 'id',
    header: 'Log ID',
    render: (row) => <AdminIdCell id={row.id} />,
  },
  {
    key: 'userId',
    header: 'User ID',
    render: (row) => <AdminIdCell id={row.userId} />,
  },
  {
    key: 'eventType',
    header: 'Event Type',
    render: (row) => (
      <AdminBadge variant="default">{row.eventType.replace(/_/g, ' ')}</AdminBadge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Time',
    render: (row) => <AdminDateCell date={row.createdAt} />,
  },
];

export function ActivityLogClient({ logs, total, page, totalPages, filterUserId, filterEventType }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState(filterUserId);
  const [eventType, setEventType] = useState(filterEventType);

  function applyFilters() {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (eventType) params.set('eventType', eventType);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    setUserId('');
    setEventType('');
    router.push('?page=1');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminCard title="Filters">
        <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>User ID</label>
            <AdminInput value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Filter by user ID" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>Event Type</label>
            <AdminInput value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="Filter by event type" />
          </div>
          <AdminButton onClick={applyFilters} variant="primary" size="sm">Apply</AdminButton>
          <AdminButton onClick={clearFilters} variant="secondary" size="sm">Clear</AdminButton>
        </div>
      </AdminCard>

      {logs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No activity logs match the current filters.</p>
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={logs as ActivityLogRow[]}
            getRowKey={(row) => row.id}
            caption={`${total} activity log entries`}
          />
          {totalPages > 1 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const params = new URLSearchParams();
                if (filterUserId) params.set('userId', filterUserId);
                if (filterEventType) params.set('eventType', filterEventType);
                params.set('page', String(p));
                return `?${params.toString()}`;
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
