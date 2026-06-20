import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminAssessmentDetail,
  updateAdminAssessment,
  type AdminAssessmentSettings,
} from '../../../../lib/api/admin-assessments-api';
import { fetchAdminQuestions } from '../../../../lib/api/admin-question-bank-api';
import { AssessmentEditorClient } from './assessment-editor-client';
import { AssessmentQuestionBuilder } from './question-builder';
import { AssessmentSettings } from './assessment-settings';

type Props = {
  params: Promise<{ assessmentId: string }>;
};

export default async function AdminAssessmentDetailPage({ params }: Props) {
  const { assessmentId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let assessment = null;
  let fetchError: string | null = null;

  try {
    assessment = await fetchAdminAssessmentDetail(token, assessmentId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load assessment. Check backend connectivity.';
  }

  const attachedQuestions = (assessment?.questionIds ?? []).map((id) => {
    return { id, stem: `Question ${id}`, type: 'multiple_choice', difficulty: 'beginner' };
  });

  async function handleUpdate(data: {
    title: string;
    settings: Partial<AdminAssessmentSettings>;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, data);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update assessment.';
      return { error: msg };
    }
  }

  async function handleSearchQuestions(query: {
    page: number;
    search?: string;
    type?: string;
    difficulty?: string;
  }): Promise<{
    questions: Array<{ id: string; type: string; stem: string; difficulty: string; tags: string[]; status: string; createdBy: string; createdAt: string; updatedAt: string }>;
    total: number;
    page: number;
    limit: number;
    error?: string;
  }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      const result = await fetchAdminQuestions(token, query.page, 20, {
        type: query.type,
        difficulty: query.difficulty,
        status: 'published',
      });
      return result;
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to search questions.';
      return { questions: [], total: 0, page: 1, limit: 20, error: msg };
    }
  }

  async function handleUpdateSettings(settings: Record<string, unknown>): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, { settings } as never);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update settings.';
      return { error: msg };
    }
  }

  async function handleUpdateQuestions(questionIds: string[]): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, { questionIds });
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update questions.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin">Admin</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/assessments">Assessments</Link>
        <span aria-hidden="true">/</span>
        <span>{assessment?.title ?? 'Detail'}</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Assessment Detail</p>
        <h1>{assessment?.title ?? 'Assessment'}</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {assessment && (
        <>
          <AssessmentEditorClient assessment={assessment} onUpdate={handleUpdate} />
          <AssessmentSettings
            assessmentId={assessmentId}
            settings={assessment.settings}
            disabled={assessment.status === 'archived'}
            onUpdateSettings={handleUpdateSettings}
          />
          <AssessmentQuestionBuilder
            assessmentId={assessmentId}
            questionIds={assessment.questionIds}
            attachedQuestions={attachedQuestions}
            disabled={assessment.status === 'archived'}
            onSearchQuestions={handleSearchQuestions}
            onUpdateQuestions={handleUpdateQuestions}
          />
        </>
      )}
    </section>
  );
}
