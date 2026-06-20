'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminAssessmentResultItem } from '../../../../../lib/api/admin-assessment-results-api';
import {
  AdminCard,
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminDateCell,
  AdminIdCell,
  type AdminTableColumn,
} from '../../../../../components/common';

type Props = {
  readonly assessmentId: string;
  readonly results: readonly AdminAssessmentResultItem[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
};

export function AssessmentResultsList({
  assessmentId,
  results,
  total,
  page,
  totalPages,
}: Props) {
  function buildPageHref(p: number) {
    return `?page=${p}`;
  }

  const columns: AdminTableColumn<AdminAssessmentResultItem>[] = [
    {
      key: 'studentId',
      header: 'Student',
      render: (r) => <AdminIdCell id={r.studentId} />,
    },
    {
      key: 'score',
      header: 'Score',
      width: '80px',
      render: (r) => <span>{r.score}%</span>,
    },
    {
      key: 'passed',
      header: 'Result',
      width: '80px',
      render: (r) => (
        <AdminBadge variant={r.passed ? 'success' : 'error'}>
          {r.passed ? 'Pass' : 'Fail'}
        </AdminBadge>
      ),
    },
    {
      key: 'attemptedAt',
      header: 'Attempted',
      width: '120px',
      render: (r) => <AdminDateCell iso={r.attemptedAt} />,
    },
    {
      key: 'completedAt',
      header: 'Completed',
      width: '120px',
      render: (r) => r.completedAt ? <AdminDateCell iso={r.completedAt} /> : <span style={{ color: 'var(--text-secondary)' }}>In progress</span>,
    },
  ];

  return (
    <div>
      <div style={{ marginBlockEnd: 'var(--space-12)', fontSize: '14px', color: 'var(--text-secondary)' }}>
        {total} result{total !== 1 ? 's' : ''} total
      </div>

      {results.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          No results yet for this assessment.
        </p>
      ) : (
        <AdminTable
          columns={columns}
          rows={results as AdminAssessmentResultItem[]}
          getRowKey={(r) => r.id}
          caption="Assessment Results"
        />
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        buildHref={buildPageHref}
        label="Results pagination"
      />

      <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Scores and pass/fail are computed by the
        backend only. This UI displays backend-approved data.
      </div>
    </div>
  );
}
