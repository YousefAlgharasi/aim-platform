// Phase 4 — P4-055
// Admin placement sections page (server component).
//
// Route: /admin/placement/tests/[testId]/sections
//
// Scope: Placement Test phase only — admin view of sections within a placement test.
//
// Security rules:
// - Only pilot_admin and content_manager roles may access this page.
// - Role enforcement is the backend's responsibility (placement:admin:sections:manage permission).
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - section order and questionCount are displayed as-is from the backend; never recomputed.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps are displayed here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Note on backend availability:
// The endpoint GET /admin/placement/sections is declared in the API map (P4-006 endpoint #11).
// If not yet deployed, the page renders a clear notice and does not crash.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../lib/auth';
import {
  fetchAdminPlacementSections,
  AdminApiClientError,
  type AdminPlacementSectionsData,
} from '../../../../../../lib/api/admin-placement-sections-api';
import { AdminPlacementSectionsList } from './placement-sections-list';

type Props = {
  params: Promise<{ testId: string }>;
};

export default async function AdminPlacementSectionsPage({ params }: Props) {
  const { testId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPlacementSectionsData | null = null;
  let fetchError: string | null = null;
  let backendUnavailable = false;

  try {
    data = await fetchAdminPlacementSections(token, testId);
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
          : 'Failed to load placement sections. Check backend connectivity.';
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
        <span>Sections</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Placement</p>
        <h1>Placement Sections</h1>
        {data && (
          <p className="admin-page-meta">
            {data.sections.length} section{data.sections.length !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      {/* Security boundary note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Section order, question counts, and skill codes
        are backend-managed. This view is read-only — no placement scoring, mastery values,
        or AIM Engine runtime logic is present here.
      </div>

      {/* Backend not yet available */}
      {backendUnavailable && (
        <div className="admin-boundary-note" role="status">
          <strong>Notice:</strong> The admin placement sections endpoint (
          <code>GET /admin/placement/sections</code>) is not yet deployed. This page is ready
          and will display sections automatically once the backend endpoint is available.
        </div>
      )}

      {/* Error banner */}
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {/* Sections list */}
      {data && <AdminPlacementSectionsList sections={data.sections} />}
    </section>
  );
}
