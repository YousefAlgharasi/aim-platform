'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionForm } from './question-form';
import {
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  type AdminQuestionSummary,
  type QuestionType,
  type QuestionDifficulty,
} from '../../../../lib/api/admin-question-bank-api';
import {
  AdminButton,
  AdminTable,
  AdminPagination,
  AdminFilterBar,
  AdminSelect,
  AdminStatusBadge,
  AdminBadge,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../components/common';

type QuestionListProps = {
  readonly questions: AdminQuestionSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterType: string;
  readonly filterDifficulty: string;
  readonly filterStatus: string;
  readonly onCreateQuestion: (data: {
    type: QuestionType;
    stem: string;
    difficulty: QuestionDifficulty;
    explanation: string | null;
    hint: string | null;
    tags: string[];
  }) => Promise<{ error?: string }>;
  readonly onUpdateQuestion: (
    id: string,
    data: {
      stem: string;
      difficulty: QuestionDifficulty;
      explanation: string | null;
      hint: string | null;
      tags: string[];
    },
  ) => Promise<{ error?: string }>;
};

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'MCQ',
  multiple_select: 'Multi-Select',
  true_false: 'T/F',
  fill_in_the_blank: 'Fill Blank',
  short_answer: 'Short Ans.',
  ordering: 'Ordering',
  matching: 'Matching',
};

const DIFFICULTY_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'> = {
  beginner: 'success',
  elementary: 'info',
  intermediate: 'warning',
  upper_intermediate: 'primary',
  advanced: 'error',
};

export function QuestionList({
  questions,
  total,
  page,
  totalPages,
  filterType,
  filterDifficulty,
  filterStatus,
  onCreateQuestion,
  onUpdateQuestion,
}: QuestionListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminQuestionSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => { router.refresh(); });
  }

  function buildFilterHref(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterDifficulty) params.set('difficulty', filterDifficulty);
    if (filterStatus) params.set('status', filterStatus);
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    params.set('page', '1');
    return `?${params.toString()}`;
  }

  function buildPageHref(p: number) {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterDifficulty) params.set('difficulty', filterDifficulty);
    if (filterStatus) params.set('status', filterStatus);
    params.set('page', String(p));
    return `?${params.toString()}`;
  }

  async function handleCreate(data: Parameters<typeof onCreateQuestion>[0]) {
    const result = await onCreateQuestion(data);
    if (!result.error) { setShowCreate(false); refresh(); }
    return result;
  }

  async function handleUpdate(data: Parameters<typeof onUpdateQuestion>[1]) {
    if (!editing) return {};
    const result = await onUpdateQuestion(editing.id, data);
    if (!result.error) { setEditing(null); refresh(); }
    return result;
  }

  if (showCreate) {
    return <QuestionForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  }
  if (editing) {
    return <QuestionForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />;
  }

  const columns: AdminTableColumn<AdminQuestionSummary>[] = [
    {
      key: 'stem',
      header: 'Stem',
      render: (q) => (
        <span title={q.stem}>
          {q.stem.length > 80 ? `${q.stem.slice(0, 80)}…` : q.stem}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (q) => <AdminBadge variant="neutral">{TYPE_LABELS[q.type] ?? q.type}</AdminBadge>,
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      width: '120px',
      render: (q) => (
        <AdminBadge variant={DIFFICULTY_VARIANTS[q.difficulty] ?? 'neutral'}>
          {q.difficulty.replace('_', ' ')}
        </AdminBadge>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (q) =>
        q.tags.length > 0
          ? q.tags.slice(0, 3).map((tag) => (
              <AdminBadge key={tag} variant="default">{tag}</AdminBadge>
            ))
          : '—',
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (q) => <AdminStatusBadge status={q.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      width: '110px',
      render: (q) => <AdminDateCell iso={q.updatedAt} />,
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (q) => (
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => setEditing(q)}
          disabled={q.status === 'archived'}
        >
          Edit
        </AdminButton>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 'var(--space-16)' }}>
        <span>{total} question{total !== 1 ? 's' : ''}</span>
        <AdminButton variant="primary" onClick={() => setShowCreate(true)}>+ New Question</AdminButton>
      </div>

      <AdminFilterBar label="Filter questions">
        <AdminSelect
          value={filterType}
          onChange={(e) => router.push(buildFilterHref({ type: e.target.value }))}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          {QUESTION_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </AdminSelect>
        <AdminSelect
          value={filterDifficulty}
          onChange={(e) => router.push(buildFilterHref({ difficulty: e.target.value }))}
          aria-label="Filter by difficulty"
        >
          <option value="">All Difficulties</option>
          {QUESTION_DIFFICULTIES.map((d) => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
        </AdminSelect>
        <AdminSelect
          value={filterStatus}
          onChange={(e) => router.push(buildFilterHref({ status: e.target.value }))}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </AdminSelect>
      </AdminFilterBar>

      {questions.length === 0 ? (
        <p className="courses-empty">No questions match the current filters.</p>
      ) : (
        <AdminTable
          columns={columns}
          rows={questions}
          getRowKey={(q) => q.id}
          caption="Question bank"
        />
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        buildHref={buildPageHref}
        label="Questions pagination"
      />
    </div>
  );
}
