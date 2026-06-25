'use client';

import { useRouter } from 'next/navigation';
import {
  AdminTable,
  AdminIdCell,
  AdminDateCell,
  AdminPagination,
  AdminInput,
  AdminButton,
  AdminCard,
} from '../../../components/common';
import type { AdminTableColumn } from '../../../components/common';
import { useState } from 'react';

type SessionSummaryRow = {
  readonly id: string;
  readonly studentId: string;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly feedbackSummary: string | null;
};

type Props = {
  readonly summaries: readonly SessionSummaryRow[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterStudentId: string;
};

const columns: AdminTableColumn<SessionSummaryRow>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <AdminIdCell id={row.id} />,
  },
  {
    key: 'studentId',
    header: 'Student ID',
    render: (row) => <AdminIdCell id={row.studentId} />,
  },
  {
    key: 'startedAt',
    header: 'Started',
    render: (row) => <AdminDateCell date={row.startedAt} />,
  },
  {
    key: 'endedAt',
    header: 'Ended',
    render: (row) => row.endedAt ? <AdminDateCell date={row.endedAt} /> : <span>—</span>,
  },
  {
    key: 'feedbackSummary',
    header: 'Feedback',
    render: (row) => (
      <span style={{ fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
        {row.feedbackSummary ?? '—'}
      </span>
    ),
  },
];

export function SessionSummaryClient({ summaries, total, page, totalPages, filterStudentId }: Props) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(filterStudentId);

  function applyFilters() {
    const params = new URLSearchParams();
    if (studentId) params.set('studentId', studentId);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    setStudentId('');
    router.push('?page=1');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminCard title="Filters">
        <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>Student ID</label>
            <AdminInput value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Filter by student ID" />
          </div>
          <AdminButton onClick={applyFilters} variant="primary" size="sm">Apply</AdminButton>
          <AdminButton onClick={clearFilters} variant="secondary" size="sm">Clear</AdminButton>
        </div>
      </AdminCard>

      {summaries.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No session summaries match the current filters.</p>
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={summaries as SessionSummaryRow[]}
            getRowKey={(row) => row.id}
            caption={`${total} session summaries`}
          />
          {totalPages > 1 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const params = new URLSearchParams();
                if (filterStudentId) params.set('studentId', filterStudentId);
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
