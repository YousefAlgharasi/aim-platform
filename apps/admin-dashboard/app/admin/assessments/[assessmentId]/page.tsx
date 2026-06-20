import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminAssessmentDetail,
  updateAdminAssessment,
  type AdminAssessmentSettings,
} from '../../../../lib/api/admin-assessments-api';
import { AssessmentEditorClient } from './assessment-editor-client';

type Props = {
  params: Promise<{ assessmentId: string }>;
};

export default async function AdminAssessmentDetailPage({ params }: Props) {
  const { assessmentId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let assessment = null;
  let fetchError: string | null = null;

  try {
    assessment = await fetchAdminAssessmentDetail(token, assessmentId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load assessment. Check backend connectivity.';
  }

  async function handleUpdate(data: {
    title: string;
    settings: Partial<AdminAssessmentSettings>;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminAssessment(token, assessmentId, data);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update assessment.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin">Admin</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/assessments">Assessments</Link>
        <span aria-hidden="true">/</span>
        <span>{assessment?.title ?? 'Detail'}</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Assessment Detail</p>
        <h1>{assessment?.title ?? 'Assessment'}</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {assessment && (
        <AssessmentEditorClient assessment={assessment} onUpdate={handleUpdate} />
      )}
    </section>
  );
}
