import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../core/auth';
import { AdminApiClientError } from '../../../core/api';
import {
  fetchAdminAssessmentResults,
  type AdminAssessmentResultItem,
} from '../../../features/assessments/api/admin-assessment-results-api';
import type { AdminPaginatedResponse } from '../../../core/api/admin-paginated-response';
import { AdminPageHeader } from '../../../shared/layouts/DashboardLayout';
import {
  AdminTable,
  AdminPagination,
  AdminStatusBadge,
  AdminDateCell,
  AdminIdCell,
  type AdminTableColumn,
} from '../../../shared/components/Misc';
import { AdminApiErrorState } from '../../../shared/components/error-handling';
import { AdminEmptyState } from '../../../shared/layouts/DashboardLayout';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    studentId?: string;
    assessmentId?: string;
  }>;
};

const columns: AdminTableColumn<AdminAssessmentResultItem>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (item) => <AdminIdCell id={item.id} />,
  },
  {
    key: 'studentId',
    header: 'Student',
    width: '140px',
    render: (item) =>
      item.studentName ? <span>{item.studentName}</span> : <AdminIdCell id={item.studentId} />,
  },
  {
    key: 'assessmentId',
    header: 'Assessment',
    width: '160px',
    render: (item) =>
      item.assessmentTitle ? <span>{item.assessmentTitle}</span> : <AdminIdCell id={item.assessmentId} />,
  },
  {
    key: 'score',
    header: 'Score',
    width: '80px',
    render: (item) => <span>{item.score} / {item.maxScore}</span>,
  },
  {
    key: 'passed',
    header: 'Status',
    width: '100px',
    render: (item) => (
      <AdminStatusBadge status={item.passed ? 'passed' : 'failed'} />
    ),
  },
  {
    key: 'attemptedAt',
    header: 'Date',
    width: '130px',
    render: (item) => <AdminDateCell iso={item.attemptedAt} />,
  },
];

function buildHref(
  page: number,
  params: { limit: number; studentId?: string; assessmentId?: string },
): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(params.limit));
  if (params.studentId) qs.set('studentId', params.studentId);
  if (params.assessmentId) qs.set('assessmentId', params.assessmentId);
  return `/admin/assessment-results?${qs.toString()}`;
}

export default async function AdminAssessmentResultsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(sp.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100,
  );
  const studentId = sp.studentId?.trim() || undefined;
  const assessmentId = sp.assessmentId?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPaginatedResponse<AdminAssessmentResultItem> | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminAssessmentResults(token, page, limit, { studentId, assessmentId });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load assessment results. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section>
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin">Admin</Link>
        <span aria-hidden="true">/</span>
        <span>Assessment Results</span>
      </nav>

      <AdminPageHeader
        title="Assessment Results"
        description={
          data
            ? `${data.total} result${data.total !== 1 ? 's' : ''} total`
            : undefined
        }
      />

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.data.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No results found"
          description={
            studentId || assessmentId
              ? 'Try adjusting the filters.'
              : 'No assessment attempts have been completed yet.'
          }
        />
      )}

      {data && data.data.length > 0 && (
        <>
          <AdminTable<AdminAssessmentResultItem>
            columns={columns}
            rows={data.data}
            getRowKey={(r) => r.id}
            caption={`Assessment results — page ${data.page} of ${totalPages}`}
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(p, { limit, studentId, assessmentId })}
            label="Assessment results pagination"
          />
        </>
      )}
    </section>
  );
}
