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
  type LessonStatus,
} from '../../../../lib/api/admin-lessons-api';
import { LessonsList } from './lessons-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const STATUS_OPTIONS: LessonStatus[] = ['draft', 'in_review', 'approved', 'published', 'archived'];

type Props = {
  searchParams: Promise<{
    courseId?: string; levelId?: string; chapterId?: string;
    page?: string; limit?: string; status?: string; q?: string;
  }>;
};

export default async function AdminLessonsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const { courseId, levelId, chapterId } = resolvedParams;
  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as LessonStatus)
    ? (resolvedParams.status as LessonStatus) : undefined;
  const searchQuery = resolvedParams.q?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let courses: AdminCourseSummary[] = [];
  let coursesError: string | null = null;
  try {
    courses = (await fetchAdminCourses(token, 1, 100)).courses;
  } catch (e) {
    coursesError = e instanceof AdminApiClientError ? `Backend error ${e.status}: ${e.message}` : 'Failed to load courses.';
  }

  let levels: AdminLevelSummary[] = [];
  let levelsError: string | null = null;
  if (courseId) {
    try { levels = (await fetchAdminLevels(token, courseId, 1, 100)).levels; }
    catch (e) { levelsError = e instanceof AdminApiClientError ? `Backend error ${e.status}: ${e.message}` : 'Failed to load levels.'; }
  }

  let chapters: AdminChapterSummary[] = [];
  let chaptersError: string | null = null;
  if (levelId) {
    try { chapters = (await fetchAdminChapters(token, levelId, 1, 100)).chapters; }
    catch (e) { chaptersError = e instanceof AdminApiClientError ? `Backend error ${e.status}: ${e.message}` : 'Failed to load chapters.'; }
  }

  let data: AdminLessonListData | null = null;
  let fetchError: string | null = null;
  if (chapterId) {
    try { data = await fetchAdminLessons({ token, chapterId, page, limit, status: statusFilter, q: searchQuery }); }
    catch (e) { fetchError = e instanceof AdminApiClientError ? `Backend error ${e.status}: ${e.message}` : 'Failed to load lessons.'; }
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;
  const selectedLevel = levelId ? levels.find((l) => l.id === levelId) : undefined;
  const selectedChapter = chapterId ? chapters.find((c) => c.id === chapterId) : undefined;

  async function handleCreate(formData: { title: string; description: string }): Promise<{ error?: string }> {
    'use server';
    if (!chapterId) return { error: 'No chapter selected.' };
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await createAdminLesson(t, chapterId, formData); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to create lesson.' }; }
  }

  async function handleUpdate(id: string, formData: { title: string; description: string }): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await updateAdminLesson(t, id, formData); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to update lesson.' }; }
  }

  const step = !courseId ? 0 : !levelId ? 1 : !chapterId ? 2 : 3;

  return (
    <section className="cp-page">
      <nav className="cp-breadcrumb">
        <Link href="/admin/content" className="cp-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="cp-breadcrumb-current">Lessons</span>
      </nav>

      <div className="cp-header">
        <div>
          <p className="cp-eyebrow">Curriculum</p>
          <h1 className="cp-title">Lessons</h1>
          {data && <p className="cp-subtitle">{data.total} lesson{data.total !== 1 ? 's' : ''} in {selectedChapter?.title ?? 'selected chapter'}</p>}
        </div>
      </div>

      <div className="cp-steps">
        <span className={`cp-step${step >= 0 ? ' cp-step--active' : ''}`}>1. Course</span>
        <span className={`cp-step${step >= 1 ? ' cp-step--active' : ''}`}>2. Level</span>
        <span className={`cp-step${step >= 2 ? ' cp-step--active' : ''}`}>3. Chapter</span>
        <span className={`cp-step${step >= 3 ? ' cp-step--active' : ''}`}>4. Lessons</span>
      </div>

      {/* Course selector */}
      <div className="cp-selector">
        <p className="cp-selector-label">Select a course</p>
        {coursesError && <div className="admin-error-banner" role="alert">{coursesError}</div>}
        {!coursesError && courses.length === 0 && <p className="cp-empty-hint">No courses found. <Link href="/admin/content/courses" className="cp-link">Create one</Link>.</p>}
        {!coursesError && courses.length > 0 && (
          <div className="cp-selector-grid">
            {courses.map((c) => (
              <a key={c.id} href={`?courseId=${encodeURIComponent(c.id)}`}
                className={`cp-selector-card${courseId === c.id ? ' cp-selector-card--active' : ''}`}>
                <span className="cp-selector-card-title">{c.title}</span>
                <span className={`cp-dot cp-dot--${c.status === 'published' ? 'published' : 'draft'}`} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Level selector */}
      {courseId && !coursesError && (
        <div className="cp-selector">
          <p className="cp-selector-label">Select a level in <strong>{selectedCourse?.title ?? 'course'}</strong></p>
          {levelsError && <div className="admin-error-banner" role="alert">{levelsError}</div>}
          {!levelsError && levels.length === 0 && <p className="cp-empty-hint">No levels. <Link href={`/admin/content/levels?courseId=${encodeURIComponent(courseId)}`} className="cp-link">Create one</Link>.</p>}
          {!levelsError && levels.length > 0 && (
            <div className="cp-selector-grid">
              {levels.map((l) => (
                <a key={l.id} href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(l.id)}`}
                  className={`cp-selector-card${levelId === l.id ? ' cp-selector-card--active' : ''}`}>
                  <span className="cp-selector-card-title">{l.title}</span>
                  {l.code && <code className="cp-code-badge">{l.code}</code>}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chapter selector */}
      {levelId && !levelsError && (
        <div className="cp-selector">
          <p className="cp-selector-label">Select a chapter in <strong>{selectedLevel?.title ?? 'level'}</strong></p>
          {chaptersError && <div className="admin-error-banner" role="alert">{chaptersError}</div>}
          {!chaptersError && chapters.length === 0 && <p className="cp-empty-hint">No chapters. <Link href={`/admin/content/chapters?courseId=${encodeURIComponent(courseId ?? '')}&levelId=${encodeURIComponent(levelId)}`} className="cp-link">Create one</Link>.</p>}
          {!chaptersError && chapters.length > 0 && (
            <div className="cp-selector-grid">
              {chapters.map((c) => (
                <a key={c.id} href={`?courseId=${encodeURIComponent(courseId ?? '')}&levelId=${encodeURIComponent(levelId)}&chapterId=${encodeURIComponent(c.id)}`}
                  className={`cp-selector-card${chapterId === c.id ? ' cp-selector-card--active' : ''}`}>
                  <span className="cp-selector-card-title">{c.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {chapterId && !chaptersError && (
        <form action="/admin/content/lessons" method="get" className="cp-filters">
          <input type="hidden" name="courseId" value={courseId ?? ''} />
          <input type="hidden" name="levelId" value={levelId ?? ''} />
          <input type="hidden" name="chapterId" value={chapterId} />
          <div className="cp-search-wrap">
            <svg className="cp-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input name="q" type="text" defaultValue={searchQuery ?? ''} placeholder="Search lessons…" className="cp-search" />
          </div>
          <select name="status" defaultValue={statusFilter ?? ''} className="cp-select">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button type="submit" className="cp-filter-btn">Filter</button>
        </form>
      )}

      {/* Lessons */}
      {chapterId && fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {chapterId && data && (
        <LessonsList
          lessons={data.lessons}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          courseId={courseId ?? ''}
          levelId={levelId ?? ''}
          chapterId={chapterId}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onCreateLesson={handleCreate}
          onUpdateLesson={handleUpdate}
        />
      )}

      {!courseId && !coursesError && courses.length > 0 && (
        <div className="cp-empty">
          <p className="cp-empty-title">Select a course</p>
          <p className="cp-empty-desc">Navigate through Course → Level → Chapter to manage lessons.</p>
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

        .cp-steps { display: flex; gap: 4px; flex-wrap: wrap; }
        .cp-step { font-size: 12px; font-weight: 600; color: var(--text-muted); padding: 4px 12px; border-radius: 16px; background: var(--surface-sunken); }
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

        .cp-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .cp-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
        .cp-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .cp-search {
          width: 100%; height: 38px; padding: 0 12px 0 34px;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary); font-size: 13px; font-family: inherit;
        }
        .cp-search:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .cp-select {
          height: 38px; padding: 0 10px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit; min-width: 130px;
        }
        .cp-filter-btn {
          height: 38px; padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .cp-filter-btn:hover { background: var(--color-primary-600); }

        .cp-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 60px 20px; text-align: center; }
        .cp-empty-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .cp-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        .cp-empty-hint { margin: 0; font-size: 13px; color: var(--text-muted); }
        .cp-link { color: var(--text-link); text-decoration: none; }
        .cp-link:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .cp-selector-grid { flex-direction: column; }
          .cp-selector-card { width: 100%; }
          .cp-filters { flex-direction: column; }
          .cp-search-wrap { max-width: none; }
        }
      `}</style>
    </section>
  );
}
