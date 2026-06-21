'use client';

import Link from 'next/link';
import {
  AdminCard,
  AdminTable,
  AdminBadge,
  AdminPagination,
  AdminDateCell,
  AdminIdCell,
} from '../../../../../components/common';
import type { AdminTableColumn } from '../../../../../components/common';

type LessonRow = {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly completed: boolean;
  readonly completedAt: string | null;
};

type Props = {
  readonly studentId: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly completionPct: number;
  readonly lastActiveAt: string | null;
  readonly lessons: readonly LessonRow[];
  readonly totalLessonRecords: number;
  readonly page: number;
  readonly totalPages: number;
};

const columns: AdminTableColumn<LessonRow>[] = [
  {
    key: 'lessonId',
    header: 'Lesson ID',
    render: (row) => <AdminIdCell id={row.lessonId} />,
  },
  {
    key: 'title',
    header: 'Title',
    render: (row) => row.lessonTitle,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <AdminBadge variant={row.completed ? 'success' : 'neutral'}>
        {row.completed ? 'Completed' : 'In progress'}
      </AdminBadge>
    ),
  },
  {
    key: 'completedAt',
    header: 'Completed At',
    render: (row) => row.completedAt ? <AdminDateCell date={row.completedAt} /> : <span>—</span>,
  },
];

export function StudentProgressClient({
  studentId,
  completedLessons,
  totalLessons,
  completionPct,
  lastActiveAt,
  lessons,
  totalLessonRecords,
  page,
  totalPages,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)' }}>
        <AdminCard title="Completion">
          <p style={{ fontSize: '28px', fontWeight: 'var(--weight-bold)', margin: 0, color: 'var(--text-primary)' }}>
            {completionPct}%
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 'var(--space-4) 0 0' }}>
            {completedLessons} / {totalLessons} lessons
          </p>
        </AdminCard>
        <AdminCard title="Last Active">
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
            {lastActiveAt ? <AdminDateCell date={lastActiveAt} /> : 'Never'}
          </p>
        </AdminCard>
        <AdminCard title="Quick Links">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', fontSize: '14px' }}>
            <Link href={`/admin/students/${studentId}/progress/skills`} style={{ color: 'var(--color-primary-600)' }}>
              Skill States →
            </Link>
            <Link href={`/admin/students/${studentId}/progress/weaknesses`} style={{ color: 'var(--color-primary-600)' }}>
              Weaknesses & Recommendations →
            </Link>
            <Link href={`/admin/students/${studentId}/progress/sessions`} style={{ color: 'var(--color-primary-600)' }}>
              Session History →
            </Link>
          </div>
        </AdminCard>
      </div>

      {/* Lesson progress table */}
      <AdminCard title="Lesson Progress" description={`${totalLessonRecords} lesson records`}>
        {lessons.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No lesson records found.</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={lessons as LessonRow[]}
              getRowKey={(row) => row.lessonId}
              caption="Student lesson progress"
            />
            {totalPages > 1 && (
              <AdminPagination
                page={page}
                totalPages={totalPages}
                buildHref={(p) => `?page=${p}`}
              />
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
