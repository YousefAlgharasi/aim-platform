import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminLevels,
  createAdminLevel,
  updateAdminLevel,
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
  const { courseId, page: pageParam, limit: limitParam } = await searchParams;
  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

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
      return {
        error: err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create level.',
      };
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
      return {
        error: err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update level.',
      };
    }
  }

  return (
    <section className="cp-page">
      <nav className="cp-breadcrumb">
        <Link href="/admin/content" className="cp-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="cp-breadcrumb-current">Levels</span>
      </nav>

      <div className="cp-header">
        <div>
          <p className="cp-eyebrow">Curriculum</p>
          <h1 className="cp-title">Levels</h1>
          {data && (
            <p className="cp-subtitle">
              {data.total} level{data.total !== 1 ? 's' : ''} in {selectedCourse?.title ?? 'selected course'}
            </p>
          )}
        </div>
      </div>

      {/* Course selector */}
      <div className="cp-selector">
        <p className="cp-selector-label">Select a course</p>
        {coursesError && <div className="admin-error-banner" role="alert">{coursesError}</div>}
        {!coursesError && courses.length === 0 && (
          <p className="cp-empty-hint">No courses found. <Link href="/admin/content/courses" className="cp-link">Create one</Link>.</p>
        )}
        {!coursesError && courses.length > 0 && (
          <div className="cp-selector-grid">
            {courses.map((course) => (
              <a
                key={course.id}
                href={`?courseId=${encodeURIComponent(course.id)}`}
                className={`cp-selector-card${courseId === course.id ? ' cp-selector-card--active' : ''}`}
              >
                <span className="cp-selector-card-title">{course.title}</span>
                <span className={`cp-dot cp-dot--${course.status === 'published' ? 'published' : course.status === 'archived' ? 'archived' : 'draft'}`} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Levels table */}
      {courseId && fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {courseId && data && (
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

      {!courseId && !coursesError && courses.length > 0 && (
        <div className="cp-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25"/></svg>
          <p className="cp-empty-title">Select a course</p>
          <p className="cp-empty-desc">Choose a course above to view and manage its levels.</p>
        </div>
      )}

      <style>{`
        .cp-page { display: flex; flex-direction: column; gap: 20px; }
        .cp-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .cp-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .cp-breadcrumb-link:hover { text-decoration: underline; }
        .cp-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .cp-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .cp-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .cp-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .cp-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .cp-selector { display: flex; flex-direction: column; gap: 8px; }
        .cp-selector-label { margin: 0; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .cp-selector-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .cp-selector-card {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); text-decoration: none; color: var(--text-primary);
          font-size: 13px; transition: border-color 0.15s, background 0.15s;
        }
        .cp-selector-card:hover { border-color: var(--color-primary-500); background: var(--state-hover, #f5f5f5); }
        .cp-selector-card--active { border-color: var(--color-primary-500); background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .cp-selector-card-title { font-weight: 500; }
        .cp-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .cp-dot--draft { background: var(--text-muted); }
        .cp-dot--published { background: var(--color-success-500); }
        .cp-dot--archived { background: var(--text-muted); opacity: 0.5; }
        .cp-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 60px 20px; text-align: center; }
        .cp-empty-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .cp-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        .cp-empty-hint { margin: 0; font-size: 13px; color: var(--text-muted); }
        .cp-link { color: var(--text-link); text-decoration: none; }
        .cp-link:hover { text-decoration: underline; }
      `}</style>
    </section>
  );
}
