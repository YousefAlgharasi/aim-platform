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

const STATUS_CLASSES: Record<string, string> = {
  draft: 'status-draft',
  published: 'status-published',
  archived: 'status-archived',
};

const DIFFICULTY_CLASSES: Record<string, string> = {
  beginner: 'domain-grammar',
  elementary: 'domain-vocabulary',
  intermediate: 'domain-reading',
  upper_intermediate: 'domain-listening',
  advanced: 'domain-speaking',
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

  return (
    <div>
      <div className="qb-toolbar">
        <div className="qb-filters">
          <select
            value={filterType}
            onChange={(e) => router.push(buildFilterHref({ type: e.target.value }))}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            {QUESTION_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => router.push(buildFilterHref({ difficulty: e.target.value }))}
            aria-label="Filter by difficulty"
          >
            <option value="">All Difficulties</option>
            {QUESTION_DIFFICULTIES.map((d) => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => router.push(buildFilterHref({ status: e.target.value }))}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Question</button>
      </div>

      {questions.length === 0 ? (
        <p className="courses-empty">No questions match the current filters.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Stem</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="qb-stem-cell">
                  <span title={q.stem}>
                    {q.stem.length > 80 ? `${q.stem.slice(0, 80)}…` : q.stem}
                  </span>
                </td>
                <td><span className="qb-type-badge">{TYPE_LABELS[q.type] ?? q.type}</span></td>
                <td>
                  <span className={`skill-domain-badge ${DIFFICULTY_CLASSES[q.difficulty] ?? ''}`}>
                    {q.difficulty.replace('_', ' ')}
                  </span>
                </td>
                <td className="qb-tags-cell">
                  {q.tags.length > 0
                    ? q.tags.slice(0, 3).map((tag) => (
                        <code key={tag} className="qb-tag">{tag}</code>
                      ))
                    : <span className="courses-empty">—</span>}
                </td>
                <td>
                  <span className={`status-badge ${STATUS_CLASSES[q.status] ?? ''}`}>
                    {q.status}
                  </span>
                </td>
                <td className="course-date-cell">
                  {new Date(q.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setEditing(q)}
                    disabled={q.status === 'archived'}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Questions pagination">
          {page > 1 && <a href={`?page=${page - 1}`} className="pagination-link">← Previous</a>}
          <span className="pagination-info">Page {page} of {totalPages} ({total} total)</span>
          {page < totalPages && <a href={`?page=${page + 1}`} className="pagination-link">Next →</a>}
        </nav>
      )}
    </div>
  );
}
