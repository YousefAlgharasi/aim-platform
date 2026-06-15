// Phase 3 — P3-059
// Admin question bank page.
//
// Scope: Curriculum & Content System — question bank only.
// This page does NOT implement learner practice, sessions, or AIM runtime.
//
// Security:
// - Token read server-side from HTTP-only cookie; never sent to browser.
// - Status transitions (publish, archive) intentionally absent — backend controls those.
// - Skill-to-question mapping is a separate dedicated UI (P3-060).

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  type AdminQuestionListData,
  type QuestionType,
  type QuestionDifficulty,
} from '../../../../lib/api/admin-question-bank-api';
import { QuestionList } from './question-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    type?: string;
    difficulty?: string;
    status?: string;
  }>;
};

export default async function AdminQuestionBankPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam, type, difficulty, status } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminQuestionListData | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminQuestions(token, page, limit, {
      type: type || undefined,
      difficulty: difficulty || undefined,
      status: status || undefined,
    });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load questions. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(formData: {
    type: QuestionType;
    stem: string;
    difficulty: QuestionDifficulty;
    explanation: string | null;
    hint: string | null;
    tags: string[];
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminQuestion(token, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create question.';
      return { error: msg };
    }
  }

  async function handleUpdate(
    id: string,
    formData: {
      stem: string;
      difficulty: QuestionDifficulty;
      explanation: string | null;
      hint: string | null;
      tags: string[];
    },
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminQuestion(token, id, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update question.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>Question Bank</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Question Bank</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} question{data.total !== 1 ? 's' : ''} total
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Question status (publish, archive),
        answer correctness, and skill mapping are controlled by backend APIs only.
        This UI does not implement learner practice or AIM session logic.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {data && (
        <QuestionList
          questions={data.questions}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          filterType={type ?? ''}
          filterDifficulty={difficulty ?? ''}
          filterStatus={status ?? ''}
          onCreateQuestion={handleCreate}
          onUpdateQuestion={handleUpdate}
        />
      )}
    </section>
  );
}
