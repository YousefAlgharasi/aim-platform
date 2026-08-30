import Link from 'next/link';
import { getAdminToken } from '../../../../core/api/admin-token';
import {
  fetchAdminPlacementResults,
  AdminApiClientError,
  type AdminPlacementResultListData,
} from '../../../../core/api/admin-placement-results-api';
import { AdminPlacementResultsList } from '../../../../features/placement';

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

  try {
    data = await fetchAdminPlacementResults(token, page, limit, level);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status ?? ''}: ${error.message}`
        : 'Failed to load placement results. Check backend connectivity.';
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
        <h1>Placement Results</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} result{data.total !== 1 ? 's' : ''}
          </p>
        )}
      </header>


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
