import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../lib/auth';
import { AdminApiClientError } from '../../../../../lib/api';
import {
  fetchAdminAssessmentResults,
  type AdminAssessmentResultItem,
} from '../../../../../lib/api/admin-assessment-results-api';
import { fetchAdminAssessmentDetail } from '../../../../../lib/api/admin-assessments-api';
import type { AdminPaginatedResponse } from '../../../../../lib/api/admin-paginated-response';
import { AssessmentResultsList } from './results-list';

type Props = {
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function AssessmentResultsPage({ params, searchParams }: Props) {
  const { assessmentId } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? '1', 10) || 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPaginatedResponse<AdminAssessmentResultItem> | null = null;
  let assessmentTitle = 'Assessment';
  let fetchError: string | null = null;

  try {
    const [results, assessment] = await Promise.all([
      fetchAdminAssessmentResults(token, page, 20, { assessmentId }),
      fetchAdminAssessmentDetail(token, assessmentId),
    ]);
    data = results;
    assessmentTitle = assessment.title;
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load results. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin">Admin</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/assessments">Assessments</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/assessments/${assessmentId}`}>{assessmentTitle}</Link>
        <span aria-hidden="true">/</span>
        <span>Results</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Assessment Results</p>
        <h1>{assessmentTitle} — Results</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {data && (
        <AssessmentResultsList
          assessmentId={assessmentId}
          results={data.data}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}
