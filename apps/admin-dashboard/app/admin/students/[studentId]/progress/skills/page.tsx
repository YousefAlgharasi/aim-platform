import Link from 'next/link';
import { getAdminToken } from '../../../../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../../../../lib/api';
import { fetchAdminStudentSkillStates } from '../../../../../../lib/api/admin-aim-data-api';
import { SkillStateClient } from './skill-state-client';

type Props = {
  params: Promise<{ studentId: string }>;
};

export default async function SkillStatePage({ params }: Props) {
  const { studentId } = await params;
  const token = await getAdminToken();

  let skills: Awaited<ReturnType<typeof fetchAdminStudentSkillStates>> = [];
  let fetchError: string | null = null;

  try {
    skills = await fetchAdminStudentSkillStates(token, studentId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load skill states.';
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/students">Students</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/students/${studentId}/progress`}>{studentId}</Link>
        <span aria-hidden="true">/</span>
        <span>Skill States</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Skill States</p>
        <h1>Skill Mastery States</h1>
        <p className="admin-page-meta">{skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
      </header>

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Mastery level and skill state are computed by the
        AIM Engine only. This view is read-only — no editing of mastery values is possible.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {!fetchError && (
        <SkillStateClient skills={skills} />
      )}
    </section>
  );
}
