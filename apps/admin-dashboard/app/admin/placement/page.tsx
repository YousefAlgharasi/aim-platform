import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import {
  fetchAdminPlacementTests,
  type AdminPlacementTestSummary,
  type PlacementTestStatus,
  AdminApiClientError,
} from '../../../lib/api/admin-placement-tests-api';
import { AdminPageHeader } from '../../../components/layout';
import {
  AdminTable,
  AdminPagination,
  AdminStatusBadge,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../components/common';
import { AdminApiErrorState } from '../../../components/error-handling';
import { AdminEmptyState } from '../../../components/layout';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

const columns: AdminTableColumn<AdminPlacementTestSummary>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (test) => <AdminIdCell id={test.id} />,
  },
  {
    key: 'title',
    header: 'Title',
    render: (test) => (
      <span style={{ fontWeight: 'var(--weight-medium)' as unknown as number }}>
        {test.title}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    render: (test) => <AdminStatusBadge status={test.status} />,
  },
  {
    key: 'totalSections',
    header: 'Sections',
    width: '90px',
    render: (test) => String(test.totalSections),
  },
  {
    key: 'estimatedMinutes',
    header: 'Est. Time',
    width: '100px',
    render: (test) => `${test.estimatedMinutes} min`,
  },
  {
    key: 'createdAt',
    header: 'Created',
    width: '130px',
    render: (test) => <AdminDateCell iso={test.createdAt} />,
  },
];

function buildHref(page: number, limit: number): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  return `/admin/placement?${qs.toString()}`;
}

export default async function AdminPlacementPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(sp.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100,
  );

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: { tests: AdminPlacementTestSummary[]; total: number; page: number; limit: number } | null =
    null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminPlacementTests(token, page, limit);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load placement tests. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section>
      <AdminPageHeader
        eyebrow="Assessment"
        title="Placement Tests"
        description={
          data
            ? `${data.total} placement test${data.total !== 1 ? 's' : ''} total`
            : undefined
        }
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-16)' }}>
        Placement test status transitions and CEFR level assignment are enforced by the backend.
        Only one test may be published at a time.
      </p>

      <nav style={{
        display: 'flex',
        gap: 'var(--space-12)',
        marginBottom: 'var(--space-24)',
      }}>
        <Link href="/admin/placement/tests" className="aim-nav-link">
          Manage Tests
          <style>{`
            .aim-nav-link {
              display: inline-flex;
              align-items: center;
              padding: var(--space-8) var(--space-16);
              border: 1px solid var(--border);
              border-radius: var(--radius-sm);
              font-size: 14px;
              font-weight: var(--weight-medium);
              color: var(--text-primary);
              text-decoration: none;
              transition: border-color 0.15s, background 0.15s;
            }
            .aim-nav-link:hover {
              border-color: var(--color-primary-600);
              background: var(--state-hover);
            }
          `}</style>
        </Link>
        <Link href="/admin/placement/results" className="aim-nav-link">
          View Results
        </Link>
      </nav>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.tests.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No placement tests"
          description="Create a placement test to get started."
        />
      )}

      {data && data.tests.length > 0 && (
        <>
          <AdminTable<AdminPlacementTestSummary>
            columns={columns}
            rows={data.tests}
            getRowKey={(t) => t.id}
            caption={`Placement tests — page ${data.page} of ${totalPages}`}
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(p, limit)}
            label="Placement test list pagination"
          />
        </>
      )}
    </section>
  );
}
