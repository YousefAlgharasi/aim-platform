import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchAdminDeadlines,
  type AdminDeadlineItem,
} from '../../../lib/api/admin-deadlines-api';
import type { AdminPaginatedResponse } from '../../../lib/api/admin-paginated-response';
import { AdminPageHeader } from '../../../components/layout';
import {
  AdminTable,
  AdminPagination,
  AdminDateCell,
  AdminIdCell,
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

const columns: AdminTableColumn<AdminDeadlineItem>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (item) => <AdminIdCell id={item.id} />,
  },
  {
    key: 'assessmentId',
    header: 'Assessment ID',
    width: '120px',
    render: (item) => <AdminIdCell id={item.assessmentId} />,
  },
  {
    key: 'dueAt',
    header: 'Deadline Date',
    width: '160px',
    render: (item) => <AdminDateCell iso={item.dueAt} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    width: '130px',
    render: (item) => <AdminDateCell iso={item.createdAt} />,
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    width: '130px',
    render: (item) => <AdminDateCell iso={item.updatedAt} />,
  },
];

function buildHref(page: number, limit: number): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  return `/admin/deadlines?${qs.toString()}`;
}

export default async function AdminDeadlinesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(sp.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100,
  );

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPaginatedResponse<AdminDeadlineItem> | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminDeadlines(token, page, limit);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load deadlines. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section>
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin">Admin</Link>
        <span aria-hidden="true">/</span>
        <span>Deadlines</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Assessments"
        title="Deadlines"
        description={
          data
            ? `${data.total} deadline${data.total !== 1 ? 's' : ''} total`
            : undefined
        }
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-16)' }}>
        Deadline enforcement and late/expired status are determined by the backend API.
      </p>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.data.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No deadlines found"
          description="No assessment deadlines have been configured yet."
        />
      )}

      {data && data.data.length > 0 && (
        <>
          <AdminTable<AdminDeadlineItem>
            columns={columns}
            rows={data.data}
            getRowKey={(d) => d.id}
            caption={`Deadlines — page ${data.page} of ${totalPages}`}
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(p, limit)}
            label="Deadline list pagination"
          />
        </>
      )}
    </section>
  );
}
