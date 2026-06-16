// Phase 4 — P4-054
// Admin placement tests list page (server component).
//
// Scope: Placement Test phase only — allow authorized staff to inspect placement test definitions.
//
// Security rules:
// - Only pilot_admin and content_manager roles may access this page.
// - Role enforcement is the backend's responsibility (placement:admin:tests:read permission).
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - test status (draft/published/archived) is displayed as-is from the backend; never recomputed.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps are displayed here.
// - Status transitions (draft → published → archived) are not implemented here; see P4-058.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Note on backend availability:
// The endpoint GET /admin/placement/tests is declared in the API map (P4-006 endpoint #8)
// with placement:admin:tests:read permission. If not yet deployed, the page renders a clear
// notice and does not crash or expose internal errors.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminPlacementTests,
  AdminApiClientError,
  type AdminPlacementTestListData,
} from '../../../../lib/api/admin-placement-tests-api';
import { AdminPlacementTestsList } from './placement-tests-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
  }>;
};

export default async function AdminPlacementTestsPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam, status } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPlacementTestListData | null = null;
  let fetchError: string | null = null;
  let backendUnavailable = false;

  try {
    const raw = await fetchAdminPlacementTests(token, page, limit);
    if (status) {
      const filtered = raw.tests.filter((t) => t.status === status);
      data = { ...raw, tests: filtered, total: filtered.length };
    } else {
      data = raw;
    }
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
          : 'Failed to load placement tests. Check backend connectivity.';
    }
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <section className="admin-curriculum-page">
      {/* Breadcrumb */}
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/placement">Placement</Link>
        <span aria-hidden="true">/</span>
        <span>Tests</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Placement</p>
        <h1>Placement Tests</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} test{data.total !== 1 ? 's' : ''}
            {status ? ` with status "${status}"` : ''}
          </p>
        )}
      </header>

      {/* Security boundary note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Test status (draft / published / archived),
        section counts, and estimated duration are backend-managed. This view is read-only.
        No placement scoring, CEFR thresholds, or AIM Engine runtime logic is present here.
        Status transitions are implemented in P4-058.
      </div>

      {/* Backend not yet available */}
      {backendUnavailable && (
        <div className="admin-boundary-note" role="status">
          <strong>Notice:</strong> The admin placement tests endpoint (
          <code>GET /admin/placement/tests</code>) is not yet deployed. This page is ready
          and will display tests automatically once the backend endpoint is available.
        </div>
      )}

      {/* Error banner */}
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {/* Tests list */}
      {data && (
        <AdminPlacementTestsList
          tests={data.tests}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          filterStatus={status ?? ''}
        />
      )}
    </section>
  );
}
