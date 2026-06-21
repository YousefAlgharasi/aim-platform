import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchAdminAssessments,
  createAdminAssessment,
  type AdminAssessmentType,
  type AdminAssessmentListItem,
} from '../../../lib/api/admin-assessments-api';
import type { AdminPaginatedResponse } from '../../../lib/api/admin-paginated-response';
import { AssessmentsList } from './assessments-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    type?: string;
  }>;
};

export default async function AdminAssessmentsPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam, type } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminPaginatedResponse<AdminAssessmentListItem> | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminAssessments(
      token,
      page,
      limit,
      (type as AdminAssessmentType) || undefined,
    );
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load assessments. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(formData: {
    title: string;
    type: AdminAssessmentType;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminAssessment(token, {
        title: formData.title,
        type: formData.type,
        questionIds: [],
      });
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create assessment.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin">Admin</Link>
        <span aria-hidden="true">/</span>
        <span>Assessments</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Assessments</p>
        <h1>Assessments</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} assessment{data.total !== 1 ? 's' : ''} total
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Assessment grading, scoring, pass/fail
        determination, deadline computation, and student results are controlled by
        backend APIs only. This UI does not compute scores or determine outcomes.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {data && (
        <AssessmentsList
          assessments={data.data}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          filterType={type ?? ''}
          onCreateAssessment={handleCreate}
        />
      )}
    </section>
  );
}
