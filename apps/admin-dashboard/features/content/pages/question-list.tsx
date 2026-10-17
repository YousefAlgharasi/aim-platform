'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QuestionForm } from '../components/question-form';
import {
  type AdminQuestionSummary,
  type QuestionType,
  type QuestionDifficulty,
} from '../api/admin-question-bank-api';

type Props = {
  readonly questions: AdminQuestionSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterType: string;
  readonly filterDifficulty: string;
  readonly filterStatus: string;
  readonly filterSlot?: React.ReactNode;
  readonly onCreateQuestion: (data: {
    type: QuestionType; stem: string; difficulty: QuestionDifficulty;
    explanation: string | null; hint: string | null; tags: string[];
  }) => Promise<{ error?: string }>;
  readonly onUpdateQuestion: (id: string, data: {
    stem: string; difficulty: QuestionDifficulty;
    explanation: string | null; hint: string | null; tags: string[];
  }) => Promise<{ error?: string }>;
};

const TYPE_OPTIONS: QuestionType[] = [
  'multiple_choice', 'multiple_select', 'true_false', 'fill_in_the_blank',
  'short_answer', 'ordering', 'matching',
];

const DIFFICULTY_OPTIONS: QuestionDifficulty[] = [
  'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced',
];

const STATUS_OPTIONS = ['draft', 'published', 'archived'] as const;

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'MCQ',
  multiple_select: 'Multi-Select',
  true_false: 'T/F',
  fill_in_the_blank: 'Fill Blank',
  short_answer: 'Short Ans.',
  ordering: 'Ordering',
  matching: 'Matching',
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'var(--color-success-500)',
  elementary: 'var(--color-primary-500)',
  intermediate: 'var(--color-warning-500, #f59e0b)',
  upper_intermediate: 'var(--color-warning-500, #f59e0b)',
  advanced: 'var(--color-error-500)',
};

export function QuestionList({
  questions, total, page, totalPages,
  filterType, filterDifficulty, filterStatus,
  filterSlot,
  onCreateQuestion, onUpdateQuestion,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminQuestionSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() { startTransition(() => router.refresh()); }

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

  if (showCreate) return <QuestionForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  if (editing) return <QuestionForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />;

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    if (filterType) params.set('type', filterType);
    if (filterDifficulty) params.set('difficulty', filterDifficulty);
    if (filterStatus) params.set('status', filterStatus);
    return `/admin/content/question-bank?${params.toString()}`;
  }

  return (
    <div className="ql-root">
      {/* Header */}
      <div className="qb-header">
        <div>
          <p className="qb-eyebrow">Curriculum</p>
          <h1 className="qb-title">Question Bank</h1>
          <p className="qb-subtitle">{total} question{total !== 1 ? 's' : ''} total</p>
        </div>
        <button type="button" className="qb-create-btn" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          + New Question
        </button>
      </div>

      {/* Filters */}
      {filterSlot ?? (
        <form action="/admin/content/question-bank" method="get" className="qb-filters">
          <select name="type" aria-label="Filter by type" defaultValue={filterType ?? ''} className="qb-select">
            <option value="">All types</option>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>)}
          </select>
          <select name="difficulty" aria-label="Filter by difficulty" defaultValue={filterDifficulty ?? ''} className="qb-select">
            <option value="">All difficulties</option>
            {DIFFICULTY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="status" aria-label="Filter by status" defaultValue={filterStatus ?? ''} className="qb-select">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="qb-filter-btn">Filter</button>
          {(filterType || filterDifficulty || filterStatus) && (
            <Link href="/admin/content/question-bank" className="qb-clear">Clear</Link>
          )}
        </form>
      )}

      {questions.length === 0 && (
        <div className="ql-empty">
          <p className="ql-empty-title">No questions found</p>
          <p className="ql-empty-desc">{filterType || filterDifficulty || filterStatus ? 'Try adjusting your filters.' : 'Create the first question.'}</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="ql-table-wrap">
          <table className="ql-table">
            <thead>
              <tr>
                <th className="ql-th">Stem</th>
                <th className="ql-th ql-th--type">Type</th>
                <th className="ql-th ql-th--diff">Difficulty</th>
                <th className="ql-th ql-th--tags">Tags</th>
                <th className="ql-th ql-th--status">Status</th>
                <th className="ql-th ql-th--date">Updated</th>
                <th className="ql-th ql-th--actions" />
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="ql-row">
                  <td className="ql-td">
                    <Link href={`/admin/content/question-bank/${q.id}`} className="ql-stem" title={q.stem}>
                      {q.stem.length > 80 ? `${q.stem.slice(0, 80)}…` : q.stem}
                    </Link>
                  </td>
                  <td className="ql-td ql-td--type">
                    <span className="ql-type-pill">{TYPE_LABELS[q.type] ?? q.type}</span>
                  </td>
                  <td className="ql-td ql-td--diff">
                    <span className="ql-diff" style={{ color: DIFFICULTY_COLOR[q.difficulty] ?? 'var(--text-secondary)' }}>
                      {q.difficulty.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="ql-td ql-td--tags">
                    {q.tags.length > 0 ? (
                      <div className="ql-tags">
                        {q.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="ql-tag">{tag}</span>
                        ))}
                        {q.tags.length > 3 && <span className="ql-tag-more">+{q.tags.length - 3}</span>}
                      </div>
                    ) : <span className="ql-muted">--</span>}
                  </td>
                  <td className="ql-td">
                    <span className="ql-status">
                      <span className="ql-status-dot" style={{ background: STATUS_DOT[q.status] ?? 'var(--text-muted)' }} />
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="ql-td ql-td--date">{fmtDate(q.updatedAt)}</td>
                  <td className="ql-td ql-td--actions">
                    <button type="button" className="ql-edit-btn" onClick={() => setEditing(q)} disabled={q.status === 'archived'}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="ql-pagination">
          {page > 1 && <Link href={buildHref(page - 1)} className="ql-page-btn">← Previous</Link>}
          <span className="ql-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildHref(page + 1)} className="ql-page-btn">Next →</Link>}
        </nav>
      )}

      <style>{`
        .ql-root { display: flex; flex-direction: column; gap: 14px; }
        .qb-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .qb-eyebrow {
          margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--color-primary-500);
        }
        .qb-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .qb-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .qb-create-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px;
          padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
          transition: background 0.15s;
        }
        .qb-create-btn:hover { background: var(--color-primary-600); }
        .qb-create-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .ql-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .ql-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .ql-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .ql-th--type { width: 90px; }
        .ql-th--diff { width: 120px; }
        .ql-th--tags { width: 160px; }
        .ql-th--status { width: 100px; }
        .ql-th--date { width: 100px; }
        .ql-th--actions { width: 70px; }
        .ql-row { transition: background 0.1s; }
        .ql-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .ql-row:not(:last-child) .ql-td { border-bottom: 1px solid var(--border); }
        .ql-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .ql-td--type { font-size: 12px; }
        .ql-td--diff { font-size: 12px; text-transform: capitalize; }
        .ql-td--tags { font-size: 12px; }
        .ql-td--date { font-size: 12px; color: var(--text-secondary); }
        .ql-td--actions { text-align: right; }
        .ql-stem { font-weight: 500; color: var(--text-primary); line-height: 1.4; }
        .ql-type-pill {
          display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); font-size: 11px; font-weight: 600;
          color: var(--text-secondary); background: var(--surface);
        }
        .ql-diff { font-weight: 600; font-size: 12px; }
        .ql-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .ql-tag {
          display: inline-block; padding: 1px 6px; border-radius: var(--radius-sm);
          background: var(--surface-sunken); border: 1px solid var(--border);
          font-size: 11px; color: var(--text-secondary);
        }
        .ql-tag-more { font-size: 11px; color: var(--text-muted); padding: 1px 4px; }
        .ql-muted { color: var(--text-muted); }
        .ql-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .ql-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ql-edit-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .ql-edit-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .ql-edit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ql-pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; }
        .ql-page-btn { font-size: 13px; font-weight: 600; color: var(--color-primary-500); text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm); }
        .ql-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .ql-page-info { font-size: 13px; color: var(--text-secondary); }
        .ql-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .ql-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .ql-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .ql-th--tags, .ql-td--tags, .ql-th--diff, .ql-td--diff, .ql-th--date, .ql-td--date { display: none; }
        }
      `}</style>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '--';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '--'; }
}
