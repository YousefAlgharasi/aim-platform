import Link from 'next/link';
import { getAdminToken } from '../../../../../../core/api/admin-token';
import { AdminApiClientError } from '../../../../../../core/api';
import {
  fetchAdminStudentWeaknesses,
  fetchAdminStudentRecommendations,
} from '../../../../../../core/api/admin-aim-data-api';
import { WeaknessesRecommendationsClient } from '../../../../../../features/students';

type Props = {
  params: Promise<{ studentId: string }>;
};

export default async function WeaknessesPage({ params }: Props) {
  const { studentId } = await params;
  const token = await getAdminToken();

  let weaknesses: Awaited<ReturnType<typeof fetchAdminStudentWeaknesses>> = [];
  let recommendations: Awaited<ReturnType<typeof fetchAdminStudentRecommendations>> = [];
  let fetchError: string | null = null;

  try {
    [weaknesses, recommendations] = await Promise.all([
      fetchAdminStudentWeaknesses(token, studentId),
      fetchAdminStudentRecommendations(token, studentId),
    ]);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load weaknesses and recommendations.';
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/students">Students</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/students/${studentId}/progress`}>{studentId}</Link>
        <span aria-hidden="true">/</span>
        <span>Weaknesses & Recommendations</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — AIM Outcomes</p>
        <h1>Weaknesses & Recommendations</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {!fetchError && (
        <WeaknessesRecommendationsClient
          weaknesses={weaknesses}
          recommendations={recommendations}
        />
      )}
    </section>
  );
}
