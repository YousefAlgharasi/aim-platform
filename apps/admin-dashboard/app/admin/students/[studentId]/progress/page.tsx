import Link from 'next/link';
import { getAdminToken } from '../../../../../core/api/admin-token';
import { AdminApiClientError } from '../../../../../core/api';
import { fetchAdminStudentProfile } from '../../../../../core/api/admin-student-profile-api';
import { StudentProgressClient, studentDisplayName } from '../../../../../features/students';

type Props = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentProgressPage({ params }: Props) {
  const { studentId } = await params;
  const token = await getAdminToken();

  let profile = null;
  let fetchError: string | null = null;

  try {
    profile = await fetchAdminStudentProfile(token, studentId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load student profile.';
  }

  const heading = profile ? studentDisplayName(profile) : 'Student Profile';

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/students">Students</Link>
        <span aria-hidden="true">/</span>
        <span>{studentId}</span>
      </nav>

      <header className="admin-page-header">
        <h1>{heading}</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {profile && <StudentProgressClient profile={profile} />}
    </section>
  );
}
