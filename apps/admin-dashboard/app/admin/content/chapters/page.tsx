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

  let courses: AdminCourseSummary[] = [];
  let coursesError: string | null = null;
  try {
    const data = await fetchAdminCourses(token, 1, 100);
    courses = data.courses;
  } catch (err) {
    coursesError = err instanceof AdminApiClientError
      ? `Backend error ${err.status}: ${err.message}` : 'Failed to load courses.';
  }

  let levels: AdminLevelSummary[] = [];
  let levelsError: string | null = null;
  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;
  if (courseId && !coursesError) {
    try {
      const data = await fetchAdminLevels(token, courseId, 1, 100);
      levels = data.levels;
    } catch (err) {
      levelsError = err instanceof AdminApiClientError
        ? `Backend error ${err.status}: ${err.message}` : 'Failed to load levels.';
    }
  }

  let chaptersData: AdminChapterListData | null = null;
  let chaptersError: string | null = null;
  const selectedLevel = levelId ? levels.find((l) => l.id === levelId) : undefined;
  if (levelId && courseId && !levelsError) {
    try {
      chaptersData = await fetchAdminChapters(token, levelId, page, limit);
    } catch (err) {
      chaptersError = err instanceof AdminApiClientError
        ? `Backend error ${err.status}: ${err.message}` : 'Failed to load chapters.';
    }
  }

  const totalPages = chaptersData ? Math.ceil(chaptersData.total / chaptersData.limit) : 0;

  async function handleCreate(formData: {
    title: string; slug: string | null; description: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    if (!levelId) return { error: 'No level selected.' };
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminChapter(token, { levelId, ...formData });
      return {};
    } catch (err) {
      return { error: err instanceof AdminApiClientError
        ? `Backend error ${err.status}: ${err.message}` : 'Failed to create chapter.' };
    }
  }

  async function handleUpdate(
    id: string, formData: { title: string; slug: string | null; description: string | null },
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminChapter(token, id, formData);
      return {};
    } catch (err) {
      return { error: err instanceof AdminApiClientError
        ? `Backend error ${err.status}: ${err.message}` : 'Failed to update chapter.' };
    }
  }

  const step = !courseId ? 0 : !levelId ? 1 : 2;

  return (
    <section className="cp-page">
      <nav className="cp-breadcrumb">
        <Link href="/admin/content" className="cp-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="cp-breadcrumb-current">Chapters</span>
      </nav>

      <div className="cp-header">
        <div>
          <p className="cp-eyebrow">Curriculum</p>
          <h1 className="cp-title">Chapters</h1>
          {chaptersData && (
            <p className="cp-subtitle">
              {chaptersData.total} chapter{chaptersData.total !== 1 ? 's' : ''} in {selectedLevel?.title ?? 'selected level'}
            </p>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="cp-steps">
        <span className={`cp-step${step >= 0 ? ' cp-step--active' : ''}`}>1. Course</span>
        <span className={`cp-step${step >= 1 ? ' cp-step--active' : ''}`}>2. Level</span>
        <span className={`cp-step${step >= 2 ? ' cp-step--active' : ''}`}>3. Chapters</span>
      </div>

      {/* Step 1: Course selector */}
      <div className="cp-selector">
        <p className="cp-selector-label">Select a course</p>
        {coursesError && <div className="admin-error-banner" role="alert">{coursesError}</div>}
        {!coursesError && courses.length === 0 && (
          <p className="cp-empty-hint">No courses found. <Link href="/admin/content/courses" className="cp-link">Create one</Link>.</p>
        )}
        {!coursesError && courses.length > 0 && (
          <div className="cp-selector-grid">
            {courses.map((c) => (
              <a key={c.id} href={`?courseId=${encodeURIComponent(c.id)}`}
                className={`cp-selector-card${courseId === c.id ? ' cp-selector-card--active' : ''}`}>
                <span className="cp-selector-card-title">{c.title}</span>
                <span className={`cp-dot cp-dot--${c.status === 'published' ? 'published' : c.status === 'archived' ? 'archived' : 'draft'}`} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Level selector */}
      {courseId && !coursesError && (
        <div className="cp-selector">
          <p className="cp-selector-label">Select a level in <strong>{selectedCourse?.title ?? 'course'}</strong></p>
          {levelsError && <div className="admin-error-banner" role="alert">{levelsError}</div>}
          {!levelsError && levels.length === 0 && (
            <p className="cp-empty-hint">No levels found. <Link href={`/admin/content/levels?courseId=${encodeURIComponent(courseId)}`} className="cp-link">Create one</Link>.</p>
          )}
          {!levelsError && levels.length > 0 && (
            <div className="cp-selector-grid">
              {levels.map((l) => (
                <a key={l.id} href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(l.id)}`}
                  className={`cp-selector-card${levelId === l.id ? ' cp-selector-card--active' : ''}`}>
                  <span className="cp-selector-card-title">{l.title}</span>
                  {l.code && <code className="cp-code-badge">{l.code}</code>}
                  <span className={`cp-dot cp-dot--${l.status === 'published' ? 'published' : l.status === 'archived' ? 'archived' : 'draft'}`} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Chapters */}
      {courseId && levelId && chaptersError && <div className="admin-error-banner" role="alert">{chaptersError}</div>}

      {courseId && levelId && chaptersData && (
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

      {!courseId && !coursesError && courses.length > 0 && (
        <div className="cp-empty">
          <p className="cp-empty-title">Select a course</p>
          <p className="cp-empty-desc">Choose a course above, then a level, to manage chapters.</p>
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

        .cp-steps { display: flex; gap: 4px; }
        .cp-step {
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          padding: 4px 12px; border-radius: 16px;
          background: var(--surface-sunken);
        }
        .cp-step--active { color: var(--color-primary-600, #4f46e5); background: color-mix(in srgb, var(--color-primary-500) 10%, transparent); }

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
        .cp-code-badge { font-size: 11px; background: var(--surface-sunken); padding: 1px 5px; border-radius: 4px; color: var(--text-secondary); }
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
        @media (max-width: 640px) {
          .cp-selector-grid { flex-direction: column; }
          .cp-selector-card { width: 100%; }
        }
      `}</style>
    </section>
  );
}
