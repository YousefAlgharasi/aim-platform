import Link from 'next/link';
import { getAdminToken } from '../../../../lib/api/admin-token';
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

  const token = await getAdminToken();

  let data: AdminPlacementResultListData | null = null;
  let fetchError: string | null = null;
  let backendUnavailable = false;

  try {
    const raw = await fetchAdminPlacementResults(token, page, limit);
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
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/placement">Placement</Link>
        <span aria-hidden="true">/</span>
        <span>Results</span>
      </nav>

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

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Estimated level (CEFR), skill signals, and initial path
        assignment are computed by the backend only. This view is read-only — no placement scoring,
        mastery values, or AIM Engine runtime logic is present here.
      </div>

      {backendUnavailable && (
        <div className="admin-boundary-note" role="status">
          <strong>Notice:</strong> The admin placement results endpoint (
          <code>GET /admin/placement/results</code>) is not yet deployed. This page is ready and
          will display results automatically once the backend endpoint is available.
        </div>
      )}

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

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
