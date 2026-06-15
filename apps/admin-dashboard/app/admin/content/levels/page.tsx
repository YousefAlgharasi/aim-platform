// Phase 3 — P3-053
// Admin levels page.
//
// Scope: Curriculum & Content System — levels only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - Auth state enforcement is handled by the parent layout (admin/layout.tsx).
// - This page renders data from backend only — it makes no authorization decisions.
// - Status transitions (publish, archive) are intentionally absent; backend controls those.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminLevels,
  createAdminLevel,
  updateAdminLevel,
  type AdminLevelSummary,
  type AdminLevelListData,
} from '../../../../lib/api/admin-levels-api';
import {
  fetchAdminCourses,
  type AdminCourseSummary,
} from '../../../../lib/api/admin-courses-api';
import { AdminApiClientError } from '../../../../lib/api';
import { LevelsList } from './levels-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{ courseId?: string; page?: string; limit?: string }>;
};

export default async function AdminLevelsPage({ searchParams }: Props) {
  const {
    courseId,
    page: pageParam,
    limit: limitParam,
  } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // Always fetch the courses list for the course selector (up to 100).
  let courses: AdminCourseSummary[] = [];
  let coursesError: string | null = null;

  try {
    const coursesData = await fetchAdminCourses(token, 1, 100);
    courses = coursesData.courses;
  } catch (error) {
    coursesError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load courses. Check backend connectivity.';
  }

  // Fetch levels only when a courseId is selected.
  let data: AdminLevelListData | null = null;
  let fetchError: string | null = null;
  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;

  if (courseId) {
    try {
      data = await fetchAdminLevels(token, courseId, page, limit);
    } catch (error) {
      fetchError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to load levels. Check backend connectivity.';
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(formData: {
    title: string;
    code: string | null;
    slug: string | null;
    description: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    if (!courseId) return { error: 'No course selected.' };
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminLevel(token, courseId, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create level.';
      return { error: msg };
    }
  }

  async function handleUpdate(
    id: string,
    formData: {
      title: string;
      code: string | null;
      slug: string | null;
      description: string | null;
    },
  ): Promise<{ error?: string }> {
    'use server';
    if (!courseId) return { error: 'No course selected.' };
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminLevel(token, courseId, id, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update level.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>Levels</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Levels</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} level{data.total !== 1 ? 's' : ''} in{' '}
            {selectedCourse?.title ?? courseId}
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Level records, status, and ordering are
        controlled by backend curriculum APIs. Publish and archive actions require
        backend permission checks not exposed here.
      </div>

      {/* Course selector */}
      <div className="admin-course-selector">
        <p className="admin-course-selector-label">Select a course to view its levels:</p>

        {coursesError ? (
          <p className="admin-error-banner" role="alert">
            {coursesError}
          </p>
        ) : courses.length === 0 ? (
          <p className="courses-empty">
            No courses found. Create a course first via{' '}
            <Link href="/admin/content/courses">Courses</Link>.
          </p>
        ) : (
          <div className="admin-course-selector-links">
            {courses.map((course) => (
              <a
                key={course.id}
                href={`?courseId=${encodeURIComponent(course.id)}`}
                className={`admin-course-selector-item${
                  courseId === course.id ? ' active' : ''
                }`}
              >
                <span className="selector-item-title">{course.title}</span>
                <span
                  className={`status-badge ${
                    course.status === 'published'
                      ? 'status-published'
                      : course.status === 'archived'
                      ? 'status-archived'
                      : 'status-draft'
                  }`}
                >
                  {course.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Levels table — rendered only when a course is selected */}
      {courseId && (
        <>
          {fetchError && (
            <p className="admin-error-banner" role="alert">
              {fetchError}
            </p>
          )}

          {data && (
            <LevelsList
              levels={data.levels}
              total={data.total}
              page={data.page}
              totalPages={totalPages}
              courseId={courseId}
              onCreateLevel={handleCreate}
              onUpdateLevel={handleUpdate}
            />
          )}
        </>
      )}

      {!courseId && !coursesError && courses.length > 0 && (
        <p className="courses-empty">
          Select a course above to view and manage its levels.
        </p>
      )}
    </section>
  );
}
