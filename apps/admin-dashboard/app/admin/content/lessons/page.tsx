// Phase 3 — P3-055
// Admin lessons page.
//
// Scope: Curriculum & Content System — lessons only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - Auth state enforcement is handled by the parent layout (admin/layout.tsx).
// - This page renders data from backend only — it makes no authorization decisions.
// - Status transitions (publish, archive) are intentionally absent; backend controls those.
// - Lesson-to-skill linking is managed by a dedicated lesson-skills UI (P3-058);
//   this page does not set or display skill links. The critical "every published
//   lesson must be linked to at least one skill" rule is enforced by the backend.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import { AdminApiClientError } from '../../../../lib/api';
import {
  fetchAdminCourses,
  type AdminCourseSummary,
} from '../../../../lib/api/admin-courses-api';
import {
  fetchAdminLevels,
  type AdminLevelSummary,
} from '../../../../lib/api/admin-levels-api';
import {
  fetchAdminChapters,
  type AdminChapterSummary,
} from '../../../../lib/api/admin-chapters-api';
import {
  fetchAdminLessons,
  createAdminLesson,
  updateAdminLesson,
  type AdminLessonListData,
} from '../../../../lib/api/admin-lessons-api';
import { LessonsList } from './lessons-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{
    courseId?: string;
    levelId?: string;
    chapterId?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function AdminLessonsPage({ searchParams }: Props) {
  const {
    courseId,
    levelId,
    chapterId,
    page: pageParam,
    limit: limitParam,
  } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // Step 1: courses (always loaded for the top-level selector).
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

  // Step 2: levels for the selected course.
  let levels: AdminLevelSummary[] = [];
  let levelsError: string | null = null;

  if (courseId) {
    try {
      const levelsData = await fetchAdminLevels(token, courseId, 1, 100);
      levels = levelsData.levels;
    } catch (error) {
      levelsError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to load levels. Check backend connectivity.';
    }
  }

  // Step 3: chapters for the selected level.
  let chapters: AdminChapterSummary[] = [];
  let chaptersError: string | null = null;

  if (levelId) {
    try {
      const chaptersData = await fetchAdminChapters(token, levelId, 1, 100);
      chapters = chaptersData.chapters;
    } catch (error) {
      chaptersError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to load chapters. Check backend connectivity.';
    }
  }

  // Step 4: lessons for the selected chapter.
  let data: AdminLessonListData | null = null;
  let fetchError: string | null = null;

  if (chapterId) {
    try {
      data = await fetchAdminLessons(token, chapterId, page, limit);
    } catch (error) {
      fetchError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to load lessons. Check backend connectivity.';
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;
  const selectedLevel = levelId ? levels.find((l) => l.id === levelId) : undefined;
  const selectedChapter = chapterId ? chapters.find((c) => c.id === chapterId) : undefined;

  async function handleCreate(formData: {
    title: string;
    description: string;
  }): Promise<{ error?: string }> {
    'use server';
    if (!chapterId) return { error: 'No chapter selected.' };
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminLesson(token, chapterId, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create lesson.';
      return { error: msg };
    }
  }

  async function handleUpdate(
    id: string,
    formData: { title: string; description: string },
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminLesson(token, id, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update lesson.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>Lessons</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Lessons</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} lesson{data.total !== 1 ? 's' : ''} in{' '}
            {selectedChapter?.title ?? chapterId}
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Lesson records, status, and ordering are
        controlled by backend curriculum APIs. Publish and archive actions require
        backend permission checks not exposed here. Every lesson must be linked to
        at least one skill before it can be published — manage links via the Lesson
        Skill Linking page.
      </div>

      {/* Step 1: course selector */}
      <div className="admin-course-selector">
        <p className="admin-course-selector-label">Select a course:</p>

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

      {/* Step 2: level selector */}
      {courseId && (
        <div className="admin-course-selector">
          <p className="admin-course-selector-label">
            Select a level in {selectedCourse?.title ?? courseId}:
          </p>

          {levelsError ? (
            <p className="admin-error-banner" role="alert">
              {levelsError}
            </p>
          ) : levels.length === 0 ? (
            <p className="courses-empty">
              No levels found. Create a level first via{' '}
              <Link href={`/admin/content/levels?courseId=${encodeURIComponent(courseId)}`}>
                Levels
              </Link>
              .
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
                  <span
                    className={`status-badge ${
                      level.status === 'published'
                        ? 'status-published'
                        : level.status === 'archived'
                        ? 'status-archived'
                        : 'status-draft'
                    }`}
                  >
                    {level.status}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: chapter selector */}
      {levelId && (
        <div className="admin-course-selector">
          <p className="admin-course-selector-label">
            Select a chapter in {selectedLevel?.title ?? levelId}:
          </p>

          {chaptersError ? (
            <p className="admin-error-banner" role="alert">
              {chaptersError}
            </p>
          ) : chapters.length === 0 ? (
            <p className="courses-empty">
              No chapters found. Create a chapter first via{' '}
              <Link href={`/admin/content/chapters?levelId=${encodeURIComponent(levelId)}`}>
                Chapters
              </Link>
              .
            </p>
          ) : (
            <div className="admin-course-selector-links">
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`?courseId=${encodeURIComponent(courseId ?? '')}&levelId=${encodeURIComponent(
                    levelId,
                  )}&chapterId=${encodeURIComponent(chapter.id)}`}
                  className={`admin-course-selector-item${
                    chapterId === chapter.id ? ' active' : ''
                  }`}
                >
                  <span className="selector-item-title">{chapter.title}</span>
                  <span
                    className={`status-badge ${
                      chapter.status === 'published'
                        ? 'status-published'
                        : chapter.status === 'archived'
                        ? 'status-archived'
                        : 'status-draft'
                    }`}
                  >
                    {chapter.status}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: lessons table — rendered only when a chapter is selected */}
      {chapterId && (
        <>
          {fetchError && (
            <p className="admin-error-banner" role="alert">
              {fetchError}
            </p>
          )}

          {data && (
            <LessonsList
              lessons={data.lessons}
              total={data.total}
              page={data.page}
              totalPages={totalPages}
              courseId={courseId ?? ''}
              levelId={levelId ?? ''}
              chapterId={chapterId}
              onCreateLesson={handleCreate}
              onUpdateLesson={handleUpdate}
            />
          )}
        </>
      )}

      {!courseId && !coursesError && courses.length > 0 && (
        <p className="courses-empty">
          Select a course, level, and chapter above to view and manage its lessons.
        </p>
      )}
    </section>
  );
}
