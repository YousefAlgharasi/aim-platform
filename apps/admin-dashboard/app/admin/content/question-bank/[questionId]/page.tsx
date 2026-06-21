import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../lib/auth';
import { AdminApiClientError } from '../../../../../lib/api';
import {
  fetchAdminQuestion,
  updateAdminQuestion,
  type AdminQuestionDetail,
  type QuestionDifficulty,
} from '../../../../../lib/api/admin-question-bank-api';
import { QuestionEditorClient } from './question-editor-client';

type Props = {
  params: Promise<{ questionId: string }>;
};

export default async function AdminQuestionDetailPage({ params }: Props) {
  const { questionId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let question: AdminQuestionDetail | null = null;
  let fetchError: string | null = null;

  try {
    question = await fetchAdminQuestion(token, questionId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load question. Check backend connectivity.';
  }

  async function handleUpdate(formData: {
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
      await updateAdminQuestion(token, questionId, formData);
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
        <Link href="/admin/content/question-bank">Question Bank</Link>
        <span aria-hidden="true">/</span>
        <span>{question?.stem.slice(0, 40) ?? 'Question'}</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Question Editor</p>
        <h1>{question ? `Edit Question` : 'Question Not Found'}</h1>
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Question status (publish, archive),
        answer correctness, and skill mapping are controlled by backend APIs only.
        Choice management requires backend support (not yet available).
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {question && (
        <QuestionEditorClient
          question={question}
          onUpdate={handleUpdate}
        />
      )}
    </section>
  );
}
