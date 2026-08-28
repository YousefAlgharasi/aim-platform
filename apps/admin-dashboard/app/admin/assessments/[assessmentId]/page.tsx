import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../core/auth';
import { AdminApiClientError } from '../../../../core/api';
import {
  fetchAdminAssessmentDetail,
  updateAdminAssessment,
  publishAdminAssessment,
  unpublishAdminAssessment,
  AssessmentSettings,
  AssessmentLinkage,
  DeadlineManagement,
  AssessmentPublishing,
  type AdminAssessmentSettings,
} from '../../../../features/assessments';
import { AssessmentEditorClient } from '../../../../features/assessments/pages/assessment-editor-client';
import { AssessmentQuestionBuilder } from '../../../../features/assessments/components/question-builder';
import { fetchAdminQuestions } from '../../../../features/content/api/admin-question-bank-api';
import { fetchAdminCourses } from '../../../../features/content/api/admin-courses-api';
import { fetchAdminChapters } from '../../../../features/content/api/admin-chapters-api';

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

  // Course/chapter options for the linkage picker. Best-effort: if either
  // list fails to load, the picker still renders with an empty list rather
  // than blocking the whole page.
  let courseOptions: Array<{ id: string; title: string }> = [];
  let chapterOptions: Array<{ id: string; title: string }> = [];
  try {
    const courseList = await fetchAdminCourses(token, 1, 200);
    courseOptions = courseList.courses.map((c) => ({ id: c.id, title: c.title }));
  } catch {
    courseOptions = [];
  }
  try {
    const chapterList = await fetchAdminChapters(token, undefined, 1, 200);
    chapterOptions = chapterList.chapters.map((c) => ({ id: c.id, title: c.title }));
  } catch {
    chapterOptions = [];
  }

  // The backend detail endpoint returns question count only, not per-question
  // detail — there is no real data to attach here, so this stays empty rather
  // than fabricating placeholder question stems.
  const attachedQuestions: Array<{ id: string; stem: string; type: string; difficulty: string }> = [];

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

  async function handlePublish(): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await publishAdminAssessment(token, assessmentId);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to publish assessment.';
      return { error: msg };
    }
  }

  async function handleUnpublish(): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await unpublishAdminAssessment(token, assessmentId);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to unpublish assessment.';
      return { error: msg };
    }
  }

  async function handleArchive(): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, { status: 'archived' });
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to archive assessment.';
      return { error: msg };
    }
  }

  async function handleUpdateLinkage(data: {
    courseId: string | null;
    chapterId: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, {
        courseId: data.courseId,
        chapterId: data.chapterId,
      });
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update course/chapter linkage.';
      return { error: msg };
    }
  }

  async function handleUpdateDeadline(deadline: {
    opensAt: string | null;
    closesAt: string | null;
    lateSubmissionPolicy: 'none' | 'penalty' | 'allow';
    latePenaltyPercent: number | null;
    lateWindowMinutes: number | null;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, { settings: deadline } as never);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update deadline.';
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
    // The backend's UpdateAssessmentSettingsDto (forbidNonWhitelisted) only
    // accepts these three fields. The settings form also tracks UI-only
    // extras (maxAttempts, gradingPolicy, etc.) that have no backend
    // persistence yet — those are intentionally not forwarded here, since
    // sending them would trip forbidNonWhitelisted and 400 the whole save.
    const { timeLimitMinutes, passMark, shuffleQuestions } = settings as Partial<AdminAssessmentSettings>;
    try {
      await updateAdminAssessment(token, assessmentId, {
        settings: { timeLimitMinutes: timeLimitMinutes ?? null, passMark: passMark ?? null, shuffleQuestions: Boolean(shuffleQuestions) },
      });
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
        <h1>{assessment?.title ?? 'Assessment'}</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {assessment && (
        <>
          <AssessmentEditorClient assessment={assessment} onUpdate={handleUpdate} />
          <AssessmentLinkage
            assessmentId={assessmentId}
            courseId={assessment.courseId}
            chapterId={assessment.chapterId}
            courses={courseOptions}
            chapters={chapterOptions}
            disabled={assessment.status === 'archived'}
            onUpdateLinkage={handleUpdateLinkage}
          />
          <AssessmentPublishing
            assessmentId={assessmentId}
            status={assessment.status}
            questionCount={assessment.questionIds.length}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onArchive={handleArchive}
          />
          <AssessmentSettings
            assessmentId={assessmentId}
            settings={assessment.settings}
            disabled={assessment.status === 'archived'}
            onUpdateSettings={handleUpdateSettings}
          />
          {/* Per-assessment deadline windows live in assessment_deadlines (see
              /admin/deadlines) and are not part of the assessment detail
              response — this widget starts from empty/unset defaults rather
              than fabricating values the backend never returned. */}
          <DeadlineManagement
            assessmentId={assessmentId}
            deadline={{
              opensAt: null,
              closesAt: null,
              lateSubmissionPolicy: 'none',
              latePenaltyPercent: null,
              lateWindowMinutes: null,
            }}
            disabled={assessment.status === 'archived'}
            onUpdateDeadline={handleUpdateDeadline}
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
