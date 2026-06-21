// P11-023: Admin chapters page with AIM design system.
// Nested under courses: select course → select level → view/manage chapters.
// Backend is final authority for chapter data and status transitions.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminChapters,
  createAdminChapter,
  updateAdminChapter,
  type AdminChapterSummary,
  type AdminChapterListData,
  type ChapterStatus,
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
import {
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../components/common';
import { AdminPageHeader, AdminEmptyState } from '../../../../components/layout';
import { AdminApiErrorState } from '../../../../components/error-handling';
import { ChaptersList } from './chapters-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

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
    page?: string;
    limit?: string;
    status?: string;
    q?: string;
  }>;
};

const chapterColumns: AdminTableColumn<AdminChapterSummary>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (ch) => (
      <Link href={`/admin/content/chapters/${ch.id}/status`} style={{ textDecoration: 'none' }}>
        <AdminIdCell id={ch.id} />
      </Link>
    ),
  },
  {
    key: 'title',
    header: 'Title',
    render: (ch) => ch.title,
  },
  {
    key: 'slug',
    header: 'Slug',
    render: (ch) =>
      ch.slug ? (
        <code style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ch.slug}</code>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>—</span>
      ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (ch) => (
      <AdminBadge variant={STATUS_VARIANT[ch.status] ?? 'neutral'}>
        {ch.status.replace('_', ' ')}
      </AdminBadge>
    ),
  },
  {
    key: 'sortOrder',
    header: 'Order',
    width: '80px',
    render: (ch) => String(ch.sortOrder),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    render: (ch) => <AdminDateCell iso={ch.updatedAt} />,
  },
];

export default async function AdminChaptersPage({ searchParams }: Props) {
  const { courseId, levelId, page: pageParam, limit: limitParam } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

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
    <section className="aim-chapters-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <span>Chapters</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title="Chapters"
        description={
          chaptersData
            ? `${chaptersData.total} chapter${chaptersData.total !== 1 ? 's' : ''} in ${selectedLevel?.title ?? levelId}`
            : undefined
        }
      />

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Chapter records, status, and ordering are
        controlled by backend curriculum APIs.
      </div>

      {/* Step 1 — Course selector */}
      <div className="aim-selector-section">
        <p className="aim-selector-label">1. Select a course:</p>
        {coursesError ? (
          <AdminApiErrorState message={coursesError} />
        ) : courses.length === 0 ? (
          <AdminEmptyState
            title="No courses found"
            description="Create one via the Courses page."
            action={<Link href="/admin/content/courses" className="admin-breadcrumb-link">Go to Courses</Link>}
          />
        ) : (
          <div className="aim-selector-grid">
            {courses.map((course) => (
              <a
                key={course.id}
                href={`?courseId=${encodeURIComponent(course.id)}`}
                className={`aim-selector-card${courseId === course.id ? ' aim-selector-card--active' : ''}`}
              >
                <span className="aim-selector-card-title">{course.title}</span>
                <AdminBadge variant={STATUS_VARIANT[course.status] ?? 'neutral'}>
                  {course.status}
                </AdminBadge>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Level selector */}
      {courseId && !coursesError && (
        <div className="aim-selector-section">
          <p className="aim-selector-label">
            2. Select a level in <strong>{selectedCourse?.title ?? courseId}</strong>:
          </p>
          {levelsError ? (
            <AdminApiErrorState message={levelsError} />
          ) : levels.length === 0 ? (
            <AdminEmptyState
              title="No levels found"
              description="Create one via the Levels page."
              action={
                <Link
                  href={`/admin/content/levels?courseId=${encodeURIComponent(courseId)}`}
                  className="admin-breadcrumb-link"
                >
                  Go to Levels
                </Link>
              }
            />
          ) : (
            <div className="aim-selector-grid">
              {levels.map((level) => (
                <a
                  key={level.id}
                  href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(level.id)}`}
                  className={`aim-selector-card${levelId === level.id ? ' aim-selector-card--active' : ''}`}
                >
                  <span className="aim-selector-card-title">{level.title}</span>
                  <AdminBadge variant={STATUS_VARIANT[level.status] ?? 'neutral'}>
                    {level.status}
                  </AdminBadge>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Chapters table */}
      {courseId && levelId && (
        <>
          {chaptersError && <AdminApiErrorState message={chaptersError} />}

          {chaptersData && chaptersData.chapters.length === 0 && (
            <AdminEmptyState
              title="No chapters yet"
              description="Create the first chapter for this level."
            />
          )}

          {chaptersData && chaptersData.chapters.length > 0 && (
            <>
              <AdminTable
                columns={chapterColumns}
                rows={chaptersData.chapters}
                getRowKey={(ch) => ch.id}
                caption="Chapters"
              />

              <AdminPagination
                page={chaptersData.page}
                totalPages={totalPages}
                buildHref={(p) =>
                  `?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&page=${p}`
                }
              />
            </>
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
        <AdminEmptyState
          title="Select a course"
          description="Choose a course above to view and manage its chapters."
        />
      )}

      <style>{`
        .aim-chapters-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
        .aim-selector-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-selector-label {
          font-size: 14px;
          font-weight: var(--weight-semibold);
          color: var(--text-secondary);
          margin: 0;
        }
        .aim-selector-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-8);
        }
        .aim-selector-card {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-8) var(--space-16);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          text-decoration: none;
          color: var(--text-primary);
          font-size: 14px;
          transition: border-color var(--duration-fast) var(--ease-standard),
                      background var(--duration-fast) var(--ease-standard);
        }
        .aim-selector-card:hover {
          border-color: var(--color-primary-500);
          background: var(--state-hover);
        }
        .aim-selector-card--active {
          border-color: var(--color-primary-500);
          background: var(--primary-soft);
        }
        .aim-selector-card-title {
          font-weight: var(--weight-medium);
        }
      `}</style>
    </section>
  );
}
