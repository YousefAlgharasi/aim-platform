'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  AdminAssessmentListItem,
  AdminAssessmentType,
} from '../../../lib/api/admin-assessments-api';
import {
  AdminButton,
  AdminCard,
  AdminTable,
  AdminPagination,
  AdminFilterBar,
  AdminSelect,
  AdminStatusBadge,
  AdminBadge,
  AdminDateCell,
  AdminFormField,
  AdminInput,
  type AdminTableColumn,
} from '../../../components/common';

type Props = {
  readonly assessments: readonly AdminAssessmentListItem[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterType: string;
  readonly onCreateAssessment: (data: {
    title: string;
    type: AdminAssessmentType;
  }) => Promise<{ error?: string }>;
};

const TYPE_LABELS: Record<AdminAssessmentType, string> = {
  quiz: 'Quiz',
  exam: 'Exam',
};

export function AssessmentsList({
  assessments,
  total,
  page,
  totalPages,
  filterType,
  onCreateAssessment,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AdminAssessmentType>('quiz');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function buildFilterHref(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    params.set('page', '1');
    return `?${params.toString()}`;
  }

  function buildPageHref(p: number) {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    params.set('page', String(p));
    return `?${params.toString()}`;
  }

  function handleCreate() {
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFormError(null);
    startTransition(async () => {
      const result = await onCreateAssessment({
        title: newTitle.trim(),
        type: newType,
      });
      if (result.error) {
        setFormError(result.error);
      } else {
        setShowCreate(false);
        setNewTitle('');
        router.refresh();
      }
    });
  }

  if (showCreate) {
    return (
      <AdminCard title="New Assessment">
        {formError && (
          <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
            {formError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <AdminFormField id="assessment-title" label="Title" required error={fieldErrors.title}>
            <AdminInput
              id="assessment-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Unit 1 Quiz"
              disabled={isPending}
              maxLength={255}
              hasError={!!fieldErrors.title}
              aria-required="true"
            />
          </AdminFormField>

          <AdminFormField id="assessment-type" label="Type" required>
            <AdminSelect
              id="assessment-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as AdminAssessmentType)}
              disabled={isPending}
            >
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
            </AdminSelect>
          </AdminFormField>
        </div>

        <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
          <strong>Backend authority:</strong> Assessment grading, scoring, deadlines,
          and pass/fail are controlled by backend APIs only.
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
          <AdminButton variant="primary" onClick={handleCreate} disabled={isPending} loading={isPending}>
            Create Assessment
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => { setShowCreate(false); setFormError(null); setFieldErrors({}); }} disabled={isPending}>
            Cancel
          </AdminButton>
        </div>
      </AdminCard>
    );
  }

  const columns: AdminTableColumn<AdminAssessmentListItem>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (a) => (
        <Link href={`/admin/assessments/${a.id}`} style={{ color: 'var(--color-primary-600)' }}>
          {a.title}
        </Link>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '90px',
      render: (a) => <AdminBadge variant={a.type === 'exam' ? 'primary' : 'info'}>{TYPE_LABELS[a.type]}</AdminBadge>,
    },
    {
      key: 'questions',
      header: 'Questions',
      width: '100px',
      render: (a) => <span>{a.questionCount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (a) => <AdminStatusBadge status={a.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      width: '110px',
      render: (a) => <AdminDateCell iso={a.updatedAt} />,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 'var(--space-16)' }}>
        <span>{total} assessment{total !== 1 ? 's' : ''}</span>
        <AdminButton variant="primary" onClick={() => setShowCreate(true)}>+ New Assessment</AdminButton>
      </div>

      <AdminFilterBar label="Filter assessments">
        <AdminSelect
          value={filterType}
          onChange={(e) => router.push(buildFilterHref({ type: e.target.value }))}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="quiz">Quiz</option>
          <option value="exam">Exam</option>
        </AdminSelect>
      </AdminFilterBar>

      {assessments.length === 0 ? (
        <p className="courses-empty">No assessments match the current filters.</p>
      ) : (
        <AdminTable
          columns={columns}
          rows={assessments as AdminAssessmentListItem[]}
          getRowKey={(a) => a.id}
          caption="Assessments"
        />
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        buildHref={buildPageHref}
        label="Assessments pagination"
      />
    </div>
  );
}
