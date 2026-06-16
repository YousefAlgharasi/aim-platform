// Phase 4 — P4-056
// Admin placement questions page (server component).
//
// Route: /admin/placement/tests/[testId]/sections/[sectionId]/questions
//
// Scope: Placement Test phase only — admin view of placement question bank for a section.
//
// Security rules:
// - Only pilot_admin and content_manager roles may access this page.
// - Role enforcement is the backend's responsibility (placement:admin:questions:manage permission).
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - correct_answer is NEVER fetched, stored, or rendered by this page or its components.
// - question_type, prompt, mediaUrl, orderIndex, skillCode displayed as-is from backend.
// - No placement scoring, CEFR thresholds, mastery values, or AIM Engine runtime here.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Note on backend availability:
// The endpoint GET /admin/placement/questions is declared in the API map (P4-006 endpoint #13).
// If not yet deployed, the page renders a clear notice and does not crash.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../../../lib/auth';
import {
  fetchAdminPlacementQuestions,
  AdminApiClientError,
  type AdminPlacementQuestionsData,
} from '../../../../../../../../lib/api/admin-placement-questions-api';
import { AdminPlacementQuestionsList } from './placement-questions-list';

type Props = {
  params: Promise<{ testId: string; sectionId: string }>;
};

export default async function AdminPlacementQuestionsPage({ params }: Props) {
  const { testId, sectionId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPlacementQuestionsData | null = null;
  let fetchError: string | null = null;
  let backendUnavailable = false;

  try {
    data = await fetchAdminPlacementQuestions(token, sectionId);
  } catch (error) {
    if (
      error instanceof AdminApiClientError &&
      (error.status === 404 || error.status === 501 || error.status === 503)
    ) {
      backendUnavailable = true;
    } else {
      fetchError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status ?? ''}: ${error.message}`
          : 'Failed to load placement questions. Check backend connectivity.';
    }
  }

  return (
    <section className="admin-curriculum-page">
      {/* Breadcrumb */}
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/placement">Placement</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/placement/tests">Tests</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/placement/tests/${testId}/sections`}>Sections</Link>
        <span aria-hidden="true">/</span>
        <span>Questions</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Placement</p>
        <h1>Placement Questions</h1>
        {data && (
          <p className="admin-page-meta">
            {data.questions.length} question{data.questions.length !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      {/* Security boundary note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Question order, type, and skill attribution are
        backend-managed. <strong>correct_answer is never fetched or displayed</strong> —
        it is backend-only and never returned to the admin UI. No placement scoring,
        mastery values, or AIM Engine runtime logic is present here.
      </div>

      {/* Backend not yet available */}
      {backendUnavailable && (
        <div className="admin-boundary-note" role="status">
          <strong>Notice:</strong> The admin placement questions endpoint (
          <code>GET /admin/placement/questions</code>) is not yet deployed. This page is
          ready and will display questions automatically once the backend endpoint is available.
        </div>
      )}

      {/* Error banner */}
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {/* Questions list */}
      {data && <AdminPlacementQuestionsList questions={data.questions} />}
    </section>
  );
}
