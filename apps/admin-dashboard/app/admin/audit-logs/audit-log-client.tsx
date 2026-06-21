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

type AuditLogRow = {
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly createdAt: string;
};

type Props = {
  readonly logs: readonly AuditLogRow[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterUserId: string;
  readonly filterAction: string;
};

const columns: AdminTableColumn<AuditLogRow>[] = [
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
    key: 'action',
    header: 'Action',
    render: (row) => (
      <AdminBadge variant="default">{row.action.replace(/_/g, ' ')}</AdminBadge>
    ),
  },
  {
    key: 'entityType',
    header: 'Entity Type',
    render: (row) => <span style={{ fontSize: '13px' }}>{row.entityType ?? '—'}</span>,
  },
  {
    key: 'entityId',
    header: 'Entity ID',
    render: (row) => row.entityId ? <AdminIdCell id={row.entityId} /> : <span>—</span>,
  },
  {
    key: 'createdAt',
    header: 'Time',
    render: (row) => <AdminDateCell date={row.createdAt} />,
  },
];

export function AuditLogClient({ logs, total, page, totalPages, filterUserId, filterAction }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState(filterUserId);
  const [action, setAction] = useState(filterAction);

  function applyFilters() {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (action) params.set('action', action);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    setUserId('');
    setAction('');
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
            <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>Action</label>
            <AdminInput value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter by action" />
          </div>
          <AdminButton onClick={applyFilters} variant="primary" size="sm">Apply</AdminButton>
          <AdminButton onClick={clearFilters} variant="secondary" size="sm">Clear</AdminButton>
        </div>
      </AdminCard>

      {logs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No audit logs match the current filters.</p>
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={logs as AuditLogRow[]}
            getRowKey={(row) => row.id}
            caption={`${total} audit log entries`}
          />
          {totalPages > 1 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const params = new URLSearchParams();
                if (filterUserId) params.set('userId', filterUserId);
                if (filterAction) params.set('action', filterAction);
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
