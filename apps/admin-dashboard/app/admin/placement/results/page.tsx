// Phase 4 — P4-059
// Admin placement results page (server component).
//
// Scope: Placement Test phase only — allow authorized staff to inspect placement outcomes.
//
// Security rules:
// - Only pilot_admin and content_manager roles may access this page.
// - Role enforcement is the backend's responsibility (placement:admin:results:read permission).
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - estimatedLevel is displayed as-is from the backend; never recalculated by this page.
// - skillSummary signals (strong/developing/emerging) come from the backend only.
// - No raw mastery values, correctness ratios, overallScore, or skill_key are displayed.
// - No placement scoring, CEFR threshold logic, weakness map computation here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Dependencies: P4-048 (placement result read API), P4-053 (admin placement navigation)
//
// Note on backend availability:
// The backend endpoint GET /admin/placement/results is declared in P4-048 via the
// placement:admin:results:read permission. If the endpoint is not yet deployed, the page
// renders a clear "not yet available" notice — it does not crash or expose errors.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminPlacementResults,
  AdminApiClientError,
  type AdminPlacementResultListData,
} from '../../../../lib/api/admin-placement-results-api';
import { AdminPlacementResultsList } from './placement-results-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    level?: string;
  }>;
};

export default async function AdminPlacementResultsPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam, level } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPlacementResultListData | null = null;
  let fetchError: string | null = null;
  let backendUnavailable = false;

  try {
    const raw = await fetchAdminPlacementResults(token, page, limit);
    // Apply client-side level filter if backend doesn't yet support it
    if (level) {
      data = {
        ...raw,
        results: raw.results.filter((r) => r.estimatedLevel === level),
        total: raw.results.filter((r) => r.estimatedLevel === level).length,
      };
    } else {
      data = raw;
    }
  } catch (error) {
    if (
      error instanceof AdminApiClientError &&
      (error.status === 404 || error.status === 501 || error.status === 503)
    ) {
      // Admin results endpoint not yet deployed — graceful degradation
      backendUnavailable = true;
    } else {
      fetchError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status ?? ''}: ${error.message}`
          : 'Failed to load placement results. Check backend connectivity.';
    }
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <section className="admin-curriculum-page">
      {/* Breadcrumb */}
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/placement">Placement</Link>
        <span aria-hidden="true">/</span>
        <span>Results</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Placement</p>
        <h1>Placement Results</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} result{data.total !== 1 ? 's' : ''}
            {level ? ` at level ${level}` : ''}
          </p>
        )}
      </header>

      {/* Security boundary note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Estimated level (CEFR), skill signals, and initial path
        assignment are computed by the backend only. This view is read-only — no placement scoring,
        mastery values, or AIM Engine runtime logic is present here.
      </div>

      {/* Backend not yet available notice */}
      {backendUnavailable && (
        <div className="admin-boundary-note" role="status">
          <strong>Notice:</strong> The admin placement results endpoint (
          <code>GET /admin/placement/results</code>) is not yet deployed. This page is ready and
          will display results automatically once the backend endpoint is available. No action is
          required from the UI side.
        </div>
      )}

      {/* Error banner */}
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {/* Results list */}
      {data && (
        <AdminPlacementResultsList
          results={data.results}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          filterLevel={level ?? ''}
        />
      )}
    </section>
  );
}
