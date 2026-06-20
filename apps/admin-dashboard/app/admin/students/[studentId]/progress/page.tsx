import Link from 'next/link';
import { getAdminToken } from '../../../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../../../lib/api';
import {
  fetchAdminStudentProgress,
  fetchAdminStudentLessons,
} from '../../../../../lib/api/admin-student-progress-api';
import { StudentProgressClient } from './student-progress-client';

type Props = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentProgressPage({ params, searchParams }: Props) {
  const { studentId } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let progress = null;
  let lessons = null;
  let fetchError: string | null = null;

  try {
    [progress, lessons] = await Promise.all([
      fetchAdminStudentProgress(token, studentId),
      fetchAdminStudentLessons(token, studentId, page, 20),
    ]);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load student progress.';
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/students">Students</Link>
        <span aria-hidden="true">/</span>
        <span>{studentId}</span>
        <span aria-hidden="true">/</span>
        <span>Progress</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Student Progress</p>
        <h1>Progress Overview</h1>
      </header>

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Completion percentage, lesson completion status,
        and all progress metrics are computed by the backend only. This view is read-only.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {progress && lessons && (
        <StudentProgressClient
          studentId={studentId}
          completedLessons={progress.completedLessons}
          totalLessons={progress.totalLessons}
          completionPct={progress.completionPct}
          lastActiveAt={progress.lastActiveAt}
          lessons={lessons.data as { lessonId: string; lessonTitle: string; completed: boolean; completedAt: string | null }[]}
          totalLessonRecords={lessons.total}
          page={lessons.page}
          totalPages={Math.ceil(lessons.total / lessons.limit)}
        />
      )}
    </section>
  );
}
