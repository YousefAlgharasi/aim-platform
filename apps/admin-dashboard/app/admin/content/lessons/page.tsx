// P11-024: Admin lessons list page with AIM design system.
// Backend is final authority for lesson data and status transitions.

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
  type AdminLessonSummary,
  type LessonStatus,
} from '../../../../lib/api/admin-lessons-api';
import {
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminFilterBar,
  AdminInput,
  AdminSelect,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../components/common';
import { AdminPageHeader, AdminEmptyState } from '../../../../components/layout';
import { AdminApiErrorState } from '../../../../components/error-handling';
import { LessonsList } from './lessons-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const STATUS_OPTIONS: LessonStatus[] = ['draft', 'in_review', 'approved', 'published', 'archived'];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  in_review: 'warning',
  approved: 'info',
  published: 'success',
  archived: 'error',
};

type Props = {
  searchParams: Promise<{
    courseId?: string;
    levelId?: string;
    chapterId?: string;
    page?: string;
    limit?: string;
    status?: string;
    q?: string;
  }>;
};

function skillLinkHref(lessonId: string, courseId: string, levelId: string, chapterId: string): string {
  return `/admin/content/lessons/skills?lessonId=${encodeURIComponent(lessonId)}&courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&chapterId=${encodeURIComponent(chapterId)}`;
}

export default async function AdminLessonsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const {
    courseId,
    levelId,
    chapterId,
  } = resolvedParams;

  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as LessonStatus)
    ? (resolvedParams.status as LessonStatus)
    : undefined;
  const searchQuery = resolvedParams.q?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // Step 1: courses
  let courses: AdminCourseSummary[] = [];
  let coursesError: string | null = null;
  try {
    const coursesData = await fetchAdminCourses(token, 1, 100);
    courses = coursesData.courses;
  } catch (error) {
    coursesError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load courses.';
  }

  // Step 2: levels
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
          : 'Failed to load levels.';
    }
  }

  // Step 3: chapters
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
          : 'Failed to load chapters.';
    }
  }

  // Step 4: lessons
  let data: AdminLessonListData | null = null;
  let fetchError: string | null = null;
  if (chapterId) {
    try {
      data = await fetchAdminLessons({
        token,
        chapterId,
        page,
        limit,
        status: statusFilter,
        q: searchQuery,
      });
    } catch (error) {
      fetchError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to load lessons.';
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;
  const selectedLevel = levelId ? levels.find((l) => l.id === levelId) : undefined;
  const selectedChapter = chapterId ? chapters.find((c) => c.id === chapterId) : undefined;

  const columns: AdminTableColumn<AdminLessonSummary>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (lesson) => lesson.title,
    },
    {
      key: 'description',
      header: 'Description',
      render: (lesson) =>
        lesson.description ? (
          <span style={{ color: 'var(--text-secondary)' }}>{lesson.description}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lesson) => (
        <AdminBadge variant={STATUS_VARIANT[lesson.status] ?? 'neutral'}>
          {lesson.status.replace('_', ' ')}
        </AdminBadge>
      ),
    },
    {
      key: 'skills',
      header: 'Skills',
      render: (lesson) => {
        if (lesson.status === 'archived') {
          return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        }
        const href = skillLinkHref(lesson.id, courseId ?? '', levelId ?? '', chapterId ?? '');
        if (lesson.status === 'published') {
          return (
            <a href={href} className="aim-skill-link aim-skill-link--ok">
              Linked ✓
            </a>
          );
        }
        return (
          <a
            href={href}
            className="aim-skill-link aim-skill-link--required"
            title="Every lesson must be linked to at least one skill before it can be published."
          >
            Link skills ⚠
          </a>
        );
      },
    },
    {
      key: 'sortOrder',
      header: 'Order',
      width: '80px',
      render: (lesson) => String(lesson.sortOrder),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (lesson) => <AdminDateCell iso={lesson.updatedAt} />,
    },
  ];

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
    <section className="aim-lessons-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <span>Lessons</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title="Lessons"
        description={
          data
            ? `${data.total} lesson${data.total !== 1 ? 's' : ''} in ${selectedChapter?.title ?? chapterId}`
            : undefined
        }
      />

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Lesson records, status, and ordering are
        controlled by backend curriculum APIs. Every lesson must be linked to at
        least one skill before it can be published.
      </div>

      {/* Step 1: course selector */}
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
                <AdminBadge variant={STATUS_VARIANT[course.status] ?? 'neutral'}>
                  {course.status}
                </AdminBadge>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: level selector */}
      {courseId && !coursesError && (
        <div className="admin-course-selector">
          <p className="admin-course-selector-label">
            2. Select a level in <strong>{selectedCourse?.title ?? courseId}</strong>:
          </p>
          {levelsError ? (
            <p className="admin-error-banner" role="alert">{levelsError}</p>
          ) : levels.length === 0 ? (
            <p className="courses-empty">
              No levels found. Create one via{' '}
              <Link href={`/admin/content/levels?courseId=${encodeURIComponent(courseId)}`}>Levels</Link>.
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
                  <AdminBadge variant={STATUS_VARIANT[level.status] ?? 'neutral'}>
                    {level.status}
                  </AdminBadge>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: chapter selector */}
      {levelId && !levelsError && (
        <div className="admin-course-selector">
          <p className="admin-course-selector-label">
            3. Select a chapter in <strong>{selectedLevel?.title ?? levelId}</strong>:
          </p>
          {chaptersError ? (
            <p className="admin-error-banner" role="alert">{chaptersError}</p>
          ) : chapters.length === 0 ? (
            <p className="courses-empty">
              No chapters found. Create one via{' '}
              <Link href={`/admin/content/chapters?courseId=${encodeURIComponent(courseId ?? '')}&levelId=${encodeURIComponent(levelId)}`}>Chapters</Link>.
            </p>
          ) : (
            <div className="admin-course-selector-links">
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`?courseId=${encodeURIComponent(courseId ?? '')}&levelId=${encodeURIComponent(levelId)}&chapterId=${encodeURIComponent(chapter.id)}`}
                  className={`admin-course-selector-item${chapterId === chapter.id ? ' active' : ''}`}
                >
                  <span className="selector-item-title">{chapter.title}</span>
                  <AdminBadge variant={STATUS_VARIANT[chapter.status] ?? 'neutral'}>
                    {chapter.status}
                  </AdminBadge>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: lessons table */}
      {chapterId && !chaptersError && (
        <>
          <form
            action={`/admin/content/lessons`}
            method="get"
          >
            <input type="hidden" name="courseId" value={courseId ?? ''} />
            <input type="hidden" name="levelId" value={levelId ?? ''} />
            <input type="hidden" name="chapterId" value={chapterId} />
            <AdminFilterBar>
              <AdminInput
                name="q"
                placeholder="Search lessons…"
                defaultValue={searchQuery ?? ''}
                aria-label="Search lessons"
              />
              <AdminSelect
                name="status"
                defaultValue={statusFilter ?? ''}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </AdminSelect>
              <button type="submit" className="aim-filter-btn">Filter</button>
            </AdminFilterBar>
          </form>

          {fetchError && <AdminApiErrorState message={fetchError} />}

          {data && data.lessons.length === 0 && !fetchError && (
            <AdminEmptyState
              title="No lessons found"
              description={
                statusFilter || searchQuery
                  ? 'Try adjusting your filters or search query.'
                  : 'No lessons exist yet. Create the first one.'
              }
            />
          )}

          {data && data.lessons.length > 0 && (
            <>
              <AdminTable
                columns={columns}
                rows={data.lessons}
                getRowKey={(l) => l.id}
                caption="Lessons"
              />

              <AdminPagination
                page={data.page}
                totalPages={totalPages}
                buildHref={(p) => {
                  const params = new URLSearchParams();
                  params.set('courseId', courseId ?? '');
                  params.set('levelId', levelId ?? '');
                  params.set('chapterId', chapterId);
                  params.set('page', String(p));
                  if (statusFilter) params.set('status', statusFilter);
                  if (searchQuery) params.set('q', searchQuery);
                  return `/admin/content/lessons?${params.toString()}`;
                }}
              />
            </>
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
        <p className="courses-empty">Select a course above to continue.</p>
      )}

      <style>{`
        .aim-lessons-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
        .aim-filter-btn {
          display: inline-flex;
          align-items: center;
          height: var(--size-btn-md);
          padding: 0 var(--space-20);
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-primary-500);
          color: var(--text-on-primary);
          font-family: inherit;
          font-size: 14px;
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-filter-btn:hover { background: var(--color-primary-600); }
        .aim-filter-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .aim-skill-link {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: var(--weight-semibold);
          text-decoration: none;
        }
        .aim-skill-link--ok {
          background: var(--color-success-50);
          color: var(--color-success-700);
        }
        .aim-skill-link--required {
          background: var(--color-warning-50);
          color: var(--color-warning-700);
        }
        .aim-skill-link:hover { opacity: 0.85; }
      `}</style>
    </section>
  );
}
