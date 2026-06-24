import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import {
  fetchAdminAssessmentResults,
  type AdminAssessmentResultItem,
} from '../../../lib/api/admin-assessment-results-api';
import { AdminApiClientError } from '../../../lib/api';
import { AdminPageHeader } from '../../../components/layout';
import {
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminFilterBar,
  AdminInput,
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
    studentId?: string;
    assessmentId?: string;
  }>;
};

const columns: AdminTableColumn<AdminAssessmentResultItem>[] = [
  {
    key: 'id',
    header: 'Result ID',
    width: '120px',
    render: (item) => <AdminIdCell id={item.id} />,
  },
  {
    key: 'studentId',
    header: 'Student',
    width: '120px',
    render: (item) => (
      <Link href={`/admin/users/${item.studentId}`} style={{ textDecoration: 'none' }}>
        <AdminIdCell id={item.studentId} />
      </Link>
    ),
  },
  {
    key: 'assessmentId',
    header: 'Assessment',
    width: '120px',
    render: (item) => <AdminIdCell id={item.assessmentId} />,
  },
  {
    key: 'score',
    header: 'Score',
    width: '90px',
    render: (item) => (
      <span style={{ fontWeight: 'var(--weight-medium)' as unknown as number }}>
        {item.score}%
      </span>
    ),
  },
  {
    key: 'passed',
    header: 'Result',
    width: '100px',
    render: (item) => (
      <AdminBadge variant={item.passed ? 'success' : 'error'}>
        {item.passed ? 'Passed' : 'Failed'}
      </AdminBadge>
    ),
  },
  {
    key: 'attemptedAt',
    header: 'Attempted',
    width: '130px',
    render: (item) => <AdminDateCell iso={item.attemptedAt} />,
  },
  {
    key: 'completedAt',
    header: 'Completed',
    width: '130px',
    render: (item) => <AdminDateCell iso={item.completedAt} />,
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
  return `/admin/reviews?${qs.toString()}`;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
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

  let data: { data: readonly AdminAssessmentResultItem[]; total: number; page: number; limit: number } | null =
    null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminAssessmentResults(token, page, limit, { studentId, assessmentId });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load review queue. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section>
      <AdminPageHeader
        eyebrow="Quality Assurance"
        title="Review Queue"
        description={
          data
            ? `${data.total} assessment result${data.total !== 1 ? 's' : ''} total`
            : undefined
        }
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-16)' }}>
        Assessment scores and pass/fail results are computed by the backend. Review decisions are auditable.
      </p>

      <form action="/admin/reviews" method="GET">
        <AdminFilterBar label="Filter results">
          <AdminInput
            name="studentId"
            placeholder="Student ID…"
            defaultValue={studentId ?? ''}
            aria-label="Filter by student ID"
            style={{ maxWidth: 200 }}
          />
          <AdminInput
            name="assessmentId"
            placeholder="Assessment ID…"
            defaultValue={assessmentId ?? ''}
            aria-label="Filter by assessment ID"
            style={{ maxWidth: 200 }}
          />
          <input type="hidden" name="limit" value={limit} />
          <button type="submit" className="aim-filter-submit">
            Apply
            <style>{`
              .aim-filter-submit {
                display: inline-flex;
                align-items: center;
                height: var(--size-input);
                padding: 0 var(--space-16);
                border: none;
                border-radius: var(--radius-sm);
                background: var(--color-primary-600);
                color: var(--text-on-primary);
                font-size: 14px;
                font-weight: var(--weight-medium);
                cursor: pointer;
                transition: background 0.15s;
              }
              .aim-filter-submit:hover { background: var(--color-primary-700); }
              .aim-filter-submit:focus-visible {
                outline: none;
                box-shadow: var(--shadow-focus);
              }
            `}</style>
          </button>
          {(studentId || assessmentId) && (
            <Link
              href={`/admin/reviews?limit=${limit}`}
              className="aim-filter-clear"
            >
              Clear
              <style>{`
                .aim-filter-clear {
                  font-size: 13px;
                  color: var(--text-link);
                  text-decoration: none;
                }
                .aim-filter-clear:hover { text-decoration: underline; }
              `}</style>
            </Link>
          )}
        </AdminFilterBar>
      </form>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.data.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No assessment results found"
          description={
            studentId || assessmentId
              ? 'Try adjusting the filters above.'
              : 'No assessment results have been recorded yet.'
          }
        />
      )}

      {data && data.data.length > 0 && (
        <>
          <AdminTable<AdminAssessmentResultItem>
            columns={columns}
            rows={[...data.data]}
            getRowKey={(r) => r.id}
            caption={`Assessment results — page ${data.page} of ${totalPages}`}
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(p, { limit, studentId, assessmentId })}
            label="Review queue pagination"
          />
        </>
      )}
    </section>
  );
}
