'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AdminTable,
  AdminBadge,
  AdminPagination,
  AdminIdCell,
  AdminDateCell,
  AdminFilterBar,
} from '../../../shared/components/Misc';
import type { AdminTableColumn } from '../../../shared/components/Misc';
import type {
  AdminPlacementTestSummary,
  PlacementTestStatus,
} from '../../../core/api/admin-placement-tests-api';

type AdminPlacementTestsListProps = {
  readonly tests: AdminPlacementTestSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterStatus: string;
};

const STATUS_VARIANT: Record<PlacementTestStatus, 'success' | 'info' | 'neutral'> = {
  published: 'success',
  draft: 'info',
  archived: 'neutral',
};

const STATUS_LABELS: Record<PlacementTestStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

const STATUSES: PlacementTestStatus[] = ['draft', 'published', 'archived'];

export function AdminPlacementTestsList({
  tests,
  total,
  page,
  totalPages,
  filterStatus,
}: AdminPlacementTestsListProps) {
  const router = useRouter();

  const setStatus = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const columns: AdminTableColumn<AdminPlacementTestSummary>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => <span>{row.title}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <AdminBadge variant={STATUS_VARIANT[row.status] ?? 'neutral'}>
          {STATUS_LABELS[row.status] ?? row.status}
        </AdminBadge>
      ),
    },
    {
      key: 'totalSections',
      header: 'Sections',
      render: (row) => <span>{row.totalSections}</span>,
    },
    {
      key: 'estimatedMinutes',
      header: 'Est. Minutes',
      render: (row) => <span>{row.estimatedMinutes} min</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => <AdminDateCell date={row.createdAt} />,
    },
    {
      key: 'id',
      header: 'ID',
      render: (row) => <AdminIdCell id={row.id} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status !== 'archived' ? (
          <Link href={`/admin/placement/tests/${row.id}/status`} className="admin-table-link">
            Status →
          </Link>
        ) : (
          <span className="admin-table-none">Archived</span>
        ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminFilterBar
        label="Filter placement tests"
        onClearAll={filterStatus ? () => setStatus('') : undefined}
      >
        <button
          type="button"
          className={`filter-btn${!filterStatus ? ' active' : ''}`}
          onClick={() => setStatus('')}
        >
          All ({total})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`filter-btn${filterStatus === s ? ' active' : ''}`}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </AdminFilterBar>

      {tests.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {filterStatus
            ? `No placement tests with status "${filterStatus}".`
            : 'No placement tests found.'}
        </p>
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={tests}
            getRowKey={(row) => row.id}
            caption={`${total} placement test${total !== 1 ? 's' : ''}`}
          />
          {totalPages > 1 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const params = new URLSearchParams();
                if (filterStatus) params.set('status', filterStatus);
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
