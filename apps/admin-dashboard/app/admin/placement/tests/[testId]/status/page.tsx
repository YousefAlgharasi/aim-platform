// Phase 4 — P4-058
// Admin placement test status page (server component).
//
// Route: /admin/placement/tests/[testId]/status
//
// Scope: Placement Test phase only — admin control of placement test draft/published status.
//
// Security rules:
// - Only pilot_admin and content_manager roles may access this page.
// - Role enforcement is the backend's responsibility (placement:admin:tests:manage permission).
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Status transitions (draft ↔ published) are enforced entirely by the backend.
// - Only 'draft' and 'published' are valid targets; 'archived' cannot be set via this UI.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Backend dependency:
//   POST /admin/placement/tests/:id/publish — draft -> published
//   POST /admin/placement/tests/:id/archive — published -> archived
//   GET  /admin/placement/tests             — used to fetch test metadata
// If endpoints not yet deployed, the page renders a clear notice and does not crash.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../core/auth';
import {
  publishPlacementTest,
  archivePlacementTest,
  AdminApiClientError,
} from '../../../../../../core/api/admin-placement-test-status-api';
import {
  fetchAdminPlacementTests,
  type AdminPlacementTestSummary,
} from '../../../../../../core/api/admin-placement-tests-api';
import { PlacementTestStatusControl } from '../../../../../../features/placement';

type Props = {
  params: Promise<{ testId: string }>;
};

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AdminApiClientError) {
    const e = error as { status?: number; message: string };
    if (e.status === 409) {
      return 'Cannot publish: another placement test is already published. Archive it first.';
    }
    return `Backend error ${e.status ?? ''}: ${e.message}`;
  }
  return fallback;
}

export default async function AdminPlacementTestStatusPage({ params }: Props) {
  const { testId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // Fetch test metadata to display context (title, current status)
  let test: AdminPlacementTestSummary | null = null;
  let fetchError: string | null = null;
  let backendUnavailable = false;

  try {
    const data = await fetchAdminPlacementTests(token, 1, 100);
    test = data.tests.find(
      (t: AdminPlacementTestSummary) => t.id === testId,
    ) ?? null;
    if (!test) {
      fetchError = `Placement test not found (ID: …${testId.slice(-8)}).`;
    }
  } catch (err) {
    const errRecord = err as Record<string, unknown> | null;
    const status = typeof errRecord?.['status'] === 'number' ? errRecord['status'] : 0;
    if (status === 404 || status === 501 || status === 503) {
      backendUnavailable = true;
    } else {
      fetchError = toErrorMessage(
        err,
        'Failed to load placement test. Check backend connectivity.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Server actions — token captured in closure; never sent to the browser.
  // ---------------------------------------------------------------------------

  async function handleSetPublished(): Promise<{ error?: string }> {
    'use server';
    try {
      await publishPlacementTest(token, testId);
      return {};
    } catch (error) {
      return { error: toErrorMessage(error, 'Failed to publish test. Check backend connectivity.') };
    }
  }

  async function handleArchive(): Promise<{ error?: string }> {
    'use server';
    try {
      await archivePlacementTest(token, testId);
      return {};
    } catch (error) {
      return { error: toErrorMessage(error, 'Failed to archive test. Check backend connectivity.') };
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
        <span>Status</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <h1>Placement Test Status</h1>
        {test && (
          <p className="admin-page-meta">{test.title}</p>
        )}
      </header>

      {/* Backend not yet available */}
      {backendUnavailable && (
      )}

      {/* Error banner */}
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {/* Status control */}
      {test && (
        <PlacementTestStatusControl
          testId={testId}
          testTitle={test.title}
          currentStatus={test.status}
          onSetPublished={handleSetPublished}
          onArchive={handleArchive}
        />
      )}
    </section>
  );
}
