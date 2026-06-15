// Phase 3 — P3-054
// Admin chapters page.
//
// Scope: Curriculum & Content System — chapters only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - Auth enforcement is handled by the parent layout (admin/layout.tsx).
// - Status transitions (publish, archive) are intentionally absent; backend controls those.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminChapters,
  createAdminChapter,
  updateAdminChapter,
  type AdminChapterListData,
} from '../../../../lib/api/admin-chapters-api';
import {
  fetchAdminCourses,
  type AdminCourseSummary,
} from '../../../../lib/api/admin-courses-api';
import {
  fetchAdminLevels,
  type AdminLevelSummary,
} from '../../../../lib/api/admin-levels-api';
import { AdminApiClientError } from '../../../../lib/api';
import { ChaptersList } from './chapters-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    courseId?: string;
    levelId?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function AdminChaptersPage({ searchParams }: Props) {
  const { courseId, levelId, page: pageParam, limit: limitParam } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // Step 1 — always fetch courses for the course selector.
  let courses: AdminCourseSummary[] = [];
  let coursesError: string | null = null;
  try {
    const data = await fetchAdminCourses(token, 1, 100);
    courses = data.courses;
  } catch (err) {
    coursesError =
      err instanceof AdminApiClientError
        ? `Backend error ${err.status}: ${err.message}`
        : 'Failed to load courses.';
  }

  // Step 2 — fetch levels when a course is selected.
  let levels: AdminLevelSummary[] = [];
  let levelsError: string | null = null;
  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;

  if (courseId && !coursesError) {
    try {
      const data = await fetchAdminLevels(token, courseId, 1, 100);
      levels = data.levels;
    } catch (err) {
      levelsError =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to load levels.';
    }
  }

  // Step 3 — fetch chapters when a level is selected.
  let chaptersData: AdminChapterListData | null = null;
  let chaptersError: string | null = null;
  const selectedLevel = levelId ? levels.find((l) => l.id === levelId) : undefined;

  if (levelId && courseId && !levelsError) {
    try {
      chaptersData = await fetchAdminChapters(token, levelId, page, limit);
    } catch (err) {
      chaptersError =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to load chapters.';
    }
  }

  const totalPages = chaptersData ? Math.ceil(chaptersData.total / chaptersData.limit) : 0;

  async function handleCreate(formData: {
    title: string;
    slug: string | null;
    description: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    if (!levelId) return { error: 'No level selected.' };
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminChapter(token, { levelId, ...formData });
      return {};
    } catch (err) {
      return {
        error:
          err instanceof AdminApiClientError
            ? `Backend error ${err.status}: ${err.message}`
            : 'Failed to create chapter.',
      };
    }
  }

  async function handleUpdate(
    id: string,
    formData: { title: string; slug: string | null; description: string | null },
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminChapter(token, id, formData);
      return {};
    } catch (err) {
      return {
        error:
          err instanceof AdminApiClientError
            ? `Backend error ${err.status}: ${err.message}`
            : 'Failed to update chapter.',
      };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>Chapters</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Chapters</h1>
        {chaptersData && (
          <p className="admin-page-meta">
            {chaptersData.total} chapter{chaptersData.total !== 1 ? 's' : ''} in{' '}
            {selectedLevel?.title ?? levelId}
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Chapter records, status, and ordering are
        controlled by backend curriculum APIs. Publish and archive actions require
        backend permission checks not exposed here.
      </div>

      {/* Step 1 — Course selector */}
      <div className="admin-course-selector">
        <p className="admin-course-selector-label">1. Select a course:</p>
        {coursesError ? (
          <p className="admin-error-banner" role="alert">{coursesError}</p>
        ) : courses.length === 0 ? (
          <p className="courses-empty">
            No courses found. Create one via <Link href="/admin/content/courses">Courses</Link>.
          </p>
        ) : (
          <div className="admin-course-selector-links">
            {courses.map((course) => (
              <a
                key={course.id}
                href={`?courseId=${encodeURIComponent(course.id)}`}
                className={`admin-course-selector-item${courseId === course.id ? ' active' : ''}`}
              >
                <span className="selector-item-title">{course.title}</span>
                <span className={`status-badge ${course.status === 'published' ? 'status-published' : course.status === 'archived' ? 'status-archived' : 'status-draft'}`}>
                  {course.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Level selector (only when a course is selected) */}
      {courseId && !coursesError && (
        <div className="admin-course-selector">
          <p className="admin-course-selector-label">
            2. Select a level in <strong>{selectedCourse?.title ?? courseId}</strong>:
          </p>
          {levelsError ? (
            <p className="admin-error-banner" role="alert">{levelsError}</p>
          ) : levels.length === 0 ? (
            <p className="courses-empty">
              No levels found. Create one via <Link href={`/admin/content/levels?courseId=${encodeURIComponent(courseId)}`}>Levels</Link>.
            </p>
          ) : (
            <div className="admin-course-selector-links">
              {levels.map((level) => (
                <a
                  key={level.id}
                  href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(level.id)}`}
                  className={`admin-course-selector-item${levelId === level.id ? ' active' : ''}`}
                >
                  <span className="selector-item-title">{level.title}</span>
                  {level.code && <code className="level-code-badge">{level.code}</code>}
                  <span className={`status-badge ${level.status === 'published' ? 'status-published' : level.status === 'archived' ? 'status-archived' : 'status-draft'}`}>
                    {level.status}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Chapters table (only when course + level selected) */}
      {courseId && levelId && (
        <>
          {chaptersError && (
            <p className="admin-error-banner" role="alert">{chaptersError}</p>
          )}
          {chaptersData && (
            <ChaptersList
              chapters={chaptersData.chapters}
              total={chaptersData.total}
              page={chaptersData.page}
              totalPages={totalPages}
              levelId={levelId}
              courseId={courseId}
              onCreateChapter={handleCreate}
              onUpdateChapter={handleUpdate}
            />
          )}
        </>
      )}

      {!courseId && !coursesError && courses.length > 0 && (
        <p className="courses-empty">Select a course above to continue.</p>
      )}
    </section>
  );
}
