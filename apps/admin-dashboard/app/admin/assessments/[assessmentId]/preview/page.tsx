import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../lib/auth';
import { AdminApiClientError } from '../../../../../lib/api';
import {
  fetchAdminAssessmentDetail,
} from '../../../../../lib/api/admin-assessments-api';
import { fetchAdminQuestion } from '../../../../../lib/api/admin-question-bank-api';
import { AssessmentPreviewClient } from './assessment-preview-client';

type Props = {
  params: Promise<{ assessmentId: string }>;
};

export default async function AssessmentPreviewPage({ params }: Props) {
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
        : 'Failed to load assessment.';
  }

  type PreviewQuestion = {
    id: string;
    stem: string;
    type: string;
    difficulty: string;
    hint: string | null;
  };

  let questions: PreviewQuestion[] = [];
  if (assessment) {
    const results = await Promise.allSettled(
      assessment.questionIds.map((qid) => fetchAdminQuestion(token, String(qid))),
    );
    questions = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchAdminQuestion>>> => r.status === 'fulfilled')
      .map((r) => ({
        id: r.value.id,
        stem: r.value.stem,
        type: r.value.type,
        difficulty: r.value.difficulty,
        hint: r.value.hint,
      }));
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/assessments">Assessments</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/assessments/${assessmentId}`}>{assessment?.title ?? assessmentId}</Link>
        <span aria-hidden="true">/</span>
        <span>Preview</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Assessment Preview</p>
        <h1>{assessment?.title ?? 'Assessment'} — Student Preview</h1>
        {assessment && (
          <p className="admin-page-meta">
            {assessment.questionIds.length} question{assessment.questionIds.length !== 1 ? 's' : ''}
            {assessment.settings.timeLimitMinutes
              ? ` · ${assessment.settings.timeLimitMinutes} min time limit`
              : ''}
          </p>
        )}
      </header>

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Read-only preview:</strong> This shows questions as a student would see them.
        Correct answers, explanations, and scoring data are intentionally hidden.
        No answer submission is possible from this view.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {assessment && (
        <AssessmentPreviewClient
          assessmentTitle={assessment.title}
          assessmentType={assessment.type}
          timeLimitMinutes={assessment.settings.timeLimitMinutes}
          passMark={assessment.settings.passMark}
          questions={questions}
        />
      )}
    </section>
  );
}
