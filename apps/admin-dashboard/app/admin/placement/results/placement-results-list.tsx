'use client';

import { useRouter } from 'next/navigation';
import {
  AdminTable,
  AdminBadge,
  AdminPagination,
  AdminIdCell,
  AdminDateCell,
  AdminCard,
  AdminSelect,
} from '../../../../components/common';
import type { AdminTableColumn } from '../../../../components/common';
import type { AdminPlacementResultSummary } from '../../../../lib/api/admin-placement-results-api';

type Props = {
  readonly results: readonly AdminPlacementResultSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterLevel: string;
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_VARIANT: Record<string, 'info' | 'success' | 'primary'> = {
  A1: 'info',
  A2: 'info',
  B1: 'primary',
  B2: 'primary',
  C1: 'success',
  C2: 'success',
};

const columns: AdminTableColumn<AdminPlacementResultSummary>[] = [
  {
    key: 'resultId',
    header: 'Result ID',
    render: (row) => <AdminIdCell id={row.resultId} />,
  },
  {
    key: 'studentId',
    header: 'Student ID',
    render: (row) => <AdminIdCell id={row.studentId} />,
  },
  {
    key: 'estimatedLevel',
    header: 'Estimated Level',
    render: (row) => (
      <AdminBadge variant={LEVEL_VARIANT[row.estimatedLevel] ?? 'neutral'}>
        {row.estimatedLevel}
      </AdminBadge>
    ),
  },
  {
    key: 'initialPathReady',
    header: 'Initial Path',
    render: (row) => (
      <AdminBadge variant={row.initialPathReady ? 'success' : 'warning'}>
        {row.initialPathReady ? 'Ready' : 'Pending'}
      </AdminBadge>
    ),
  },
  {
    key: 'completedAt',
    header: 'Completed',
    render: (row) => <AdminDateCell date={row.completedAt} />,
  },
];

export function AdminPlacementResultsList({
  results,
  total,
  page,
  totalPages,
  filterLevel,
}: Props) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {/* Filter */}
      <AdminCard title="Filters">
        <div style={{ maxWidth: '200px' }}>
          <AdminSelect
            value={filterLevel}
            onChange={(e) => {
              const params = new URLSearchParams();
              if (e.target.value) params.set('level', e.target.value);
              params.set('page', '1');
              router.push(`?${params.toString()}`);
            }}
            aria-label="Filter by estimated level"
          >
            <option value="">All Levels</option>
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </AdminSelect>
        </div>
      </AdminCard>

      {/* Results */}
      {results.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No placement results match the current filters.
        </p>
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={results as AdminPlacementResultSummary[]}
            getRowKey={(row) => row.resultId}
            caption={`${total} placement results — estimated level is backend-assigned`}
          />
          {totalPages > 1 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const params = new URLSearchParams();
                if (filterLevel) params.set('level', filterLevel);
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
