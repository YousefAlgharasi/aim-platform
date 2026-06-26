import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  type AdminQuestionListData,
  type QuestionType,
  type QuestionDifficulty,
} from '../../../../lib/api/admin-question-bank-api';
import { QuestionList } from './question-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const STATUS_OPTIONS = ['draft', 'published', 'archived'] as const;

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'MCQ',
  multiple_select: 'Multi-Select',
  true_false: 'True/False',
  fill_in_the_blank: 'Fill Blank',
  short_answer: 'Short Answer',
  ordering: 'Ordering',
  matching: 'Matching',
};

const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  upper_intermediate: 'Upper Intermediate',
  advanced: 'Advanced',
};

type Props = {
  searchParams: Promise<{
    page?: string; limit?: string; type?: string; difficulty?: string; status?: string;
  }>;
};

export default async function AdminQuestionBankPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const typeFilter = QUESTION_TYPES.includes(resolvedParams.type as QuestionType)
    ? resolvedParams.type : undefined;
  const difficultyFilter = QUESTION_DIFFICULTIES.includes(resolvedParams.difficulty as QuestionDifficulty)
    ? resolvedParams.difficulty : undefined;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as typeof STATUS_OPTIONS[number])
    ? resolvedParams.status : undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminQuestionListData | null = null;
  let fetchError: string | null = null;
  try {
    data = await fetchAdminQuestions(token, page, limit, {
      type: typeFilter, difficulty: difficultyFilter, status: statusFilter,
    });
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status}: ${error.message}` : 'Failed to load questions.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(formData: {
    type: QuestionType; stem: string; difficulty: QuestionDifficulty;
    explanation: string | null; hint: string | null; tags: string[];
  }): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await createAdminQuestion(t, formData); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to create question.' }; }
  }

  async function handleUpdate(id: string, formData: {
    stem: string; difficulty: QuestionDifficulty;
    explanation: string | null; hint: string | null; tags: string[];
  }): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await updateAdminQuestion(t, id, formData); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to update question.' }; }
  }

  const hasFilters = typeFilter || difficultyFilter || statusFilter;

  return (
    <section className="qb-page">
      <nav className="qb-breadcrumb">
        <Link href="/admin/content" className="qb-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="qb-breadcrumb-current">Question Bank</span>
      </nav>

      <div className="qb-header">
        <div>
          <p className="qb-eyebrow">Curriculum</p>
          <h1 className="qb-title">Question Bank</h1>
          {data && <p className="qb-subtitle">{data.total} question{data.total !== 1 ? 's' : ''} total</p>}
        </div>
      </div>

      <form action="/admin/content/question-bank" method="get" className="qb-filters">
        <select name="type" defaultValue={typeFilter ?? ''} className="qb-select">
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select name="difficulty" defaultValue={difficultyFilter ?? ''} className="qb-select">
          <option value="">All difficulties</option>
          {QUESTION_DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
        </select>
        <select name="status" defaultValue={statusFilter ?? ''} className="qb-select">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="qb-filter-btn">Filter</button>
        {hasFilters && (
          <Link href="/admin/content/question-bank" className="qb-clear">Clear</Link>
        )}
      </form>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {data && (
        <QuestionList
          questions={data.questions}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          filterType={typeFilter ?? ''}
          filterDifficulty={difficultyFilter ?? ''}
          filterStatus={statusFilter ?? ''}
          onCreateQuestion={handleCreate}
          onUpdateQuestion={handleUpdate}
        />
      )}

      <style>{`
        .qb-page { display: flex; flex-direction: column; gap: 20px; }
        .qb-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .qb-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .qb-breadcrumb-link:hover { text-decoration: underline; }
        .qb-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .qb-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .qb-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .qb-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .qb-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .qb-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .qb-select {
          height: 38px; padding: 0 10px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit; min-width: 130px;
        }
        .qb-filter-btn {
          height: 38px; padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .qb-filter-btn:hover { background: var(--color-primary-600); }
        .qb-clear { font-size: 13px; color: var(--text-link); text-decoration: none; padding: 0 4px; }
        .qb-clear:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .qb-filters { flex-direction: column; }
          .qb-select { width: 100%; }
        }
      `}</style>
    </section>
  );
}
