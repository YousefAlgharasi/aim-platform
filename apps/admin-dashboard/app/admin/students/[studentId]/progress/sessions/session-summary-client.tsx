'use client';

import {
  AdminTable,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
  AdminPagination,
} from '../../../../../../components/common';
import type { AdminTableColumn } from '../../../../../../components/common';

type SessionRow = {
  readonly id: string;
  readonly studentId: string;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly feedbackSummary: string | null;
};

type Props = {
  readonly sessions: readonly SessionRow[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
};

const columns: AdminTableColumn<SessionRow>[] = [
  {
    key: 'id',
    header: 'Session ID',
    render: (row) => <AdminIdCell id={row.id} />,
  },
  {
    key: 'startedAt',
    header: 'Started',
    render: (row) => <AdminDateCell date={row.startedAt} />,
  },
  {
    key: 'endedAt',
    header: 'Ended',
    render: (row) =>
      row.endedAt ? <AdminDateCell date={row.endedAt} /> : (
        <AdminBadge variant="info">In progress</AdminBadge>
      ),
  },
  {
    key: 'feedback',
    header: 'Feedback',
    render: (row) => (
      <span style={{ fontSize: '13px', color: row.feedbackSummary ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {row.feedbackSummary ?? '—'}
      </span>
    ),
  },
];

export function SessionSummaryClient({ sessions, total, page, totalPages }: Props) {
  if (sessions.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sessions recorded for this student.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminTable
        columns={columns}
        rows={sessions as SessionRow[]}
        getRowKey={(row) => row.id}
        caption={`${total} learning sessions`}
      />
      {totalPages > 1 && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `?page=${p}`}
        />
      )}
    </div>
  );
}
