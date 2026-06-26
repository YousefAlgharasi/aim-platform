import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  type AdminCourseSummary,
  type AdminCourseListData,
  type CourseStatus,
} from '../../../../lib/api/admin-courses-api';
import { AdminApiClientError } from '../../../../lib/api';
import { CoursesList } from './courses-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const STATUS_OPTIONS: CourseStatus[] = ['draft', 'in_review', 'approved', 'published', 'archived'];

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    q?: string;
  }>;
};

export default async function AdminCoursesPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as CourseStatus)
    ? (resolvedParams.status as CourseStatus)
    : undefined;
  const searchQuery = resolvedParams.q?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminCourseListData | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminCourses({ token, page, limit, status: statusFilter, q: searchQuery });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load courses. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(formData: {
    title: string;
    slug: string | null;
    description: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminCourse(t, formData);
      return {};
    } catch (err) {
      return {
        error: err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create course.',
      };
    }
  }

  async function handleUpdate(
    id: string,
    formData: { title: string; slug: string | null; description: string | null },
  ): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminCourse(t, id, formData);
      return {};
    } catch (err) {
      return {
        error: err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update course.',
      };
    }
  }

  const statusCounts = data ? {
    draft: data.courses.filter((c) => c.status === 'draft').length,
    published: data.courses.filter((c) => c.status === 'published').length,
    in_review: data.courses.filter((c) => c.status === 'in_review').length,
    archived: data.courses.filter((c) => c.status === 'archived').length,
  } : null;

  return (
    <section className="cr-page">
      {/* Breadcrumb */}
      <nav className="cr-breadcrumb">
        <Link href="/admin/content" className="cr-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="cr-breadcrumb-current">Courses</span>
      </nav>

      {/* Header */}
      <div className="cr-header">
        <div>
          <p className="cr-eyebrow">Curriculum</p>
          <h1 className="cr-title">Courses</h1>
          {data && <p className="cr-subtitle">{data.total} course{data.total !== 1 ? 's' : ''}</p>}
        </div>
      </div>

      {/* Status Summary */}
      {statusCounts && (
        <div className="cr-status-row">
          <span className="cr-chip"><span className="cr-dot cr-dot--draft" />Draft {statusCounts.draft}</span>
          <span className="cr-chip"><span className="cr-dot cr-dot--review" />In Review {statusCounts.in_review}</span>
          <span className="cr-chip"><span className="cr-dot cr-dot--published" />Published {statusCounts.published}</span>
          <span className="cr-chip"><span className="cr-dot cr-dot--archived" />Archived {statusCounts.archived}</span>
        </div>
      )}

      {/* Filters */}
      <form action="/admin/content/courses" method="get" className="cr-filters">
        <div className="cr-search-wrap">
          <svg className="cr-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input name="q" type="text" defaultValue={searchQuery ?? ''} placeholder="Search courses…" className="cr-search" />
        </div>
        <select name="status" defaultValue={statusFilter ?? ''} className="cr-select">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <button type="submit" className="cr-filter-btn">Filter</button>
        {(statusFilter || searchQuery) && (
          <Link href="/admin/content/courses" className="cr-clear">Clear</Link>
        )}
      </form>

      {/* Error */}
      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {/* Empty */}
      {data && data.courses.length === 0 && !fetchError && (
        <div className="cr-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
          <p className="cr-empty-title">No courses found</p>
          <p className="cr-empty-desc">
            {statusFilter || searchQuery ? 'Try adjusting your filters.' : 'Create your first course to get started.'}
          </p>
        </div>
      )}

      {/* Course List (client component handles table + create/edit) */}
      {data && data.courses.length > 0 && (
        <CoursesList
          courses={data.courses}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onCreateCourse={handleCreate}
          onUpdateCourse={handleUpdate}
        />
      )}

      {/* Show create even when empty */}
      {data && data.courses.length === 0 && !fetchError && (
        <CoursesList
          courses={[]}
          total={0}
          page={1}
          totalPages={0}
          onCreateCourse={handleCreate}
          onUpdateCourse={handleUpdate}
        />
      )}

      <style>{`
        .cr-page { display: flex; flex-direction: column; gap: 20px; }

        .cr-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: var(--text-muted);
        }
        .cr-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .cr-breadcrumb-link:hover { text-decoration: underline; }
        .cr-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }

        .cr-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .cr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .cr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .cr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .cr-status-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .cr-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;
          background: var(--surface-sunken); color: var(--text-secondary);
        }
        .cr-dot { width: 7px; height: 7px; border-radius: 50%; }
        .cr-dot--draft { background: var(--text-muted); }
        .cr-dot--review { background: var(--color-warning-500, #f59e0b); }
        .cr-dot--published { background: var(--color-success-500); }
        .cr-dot--archived { background: var(--text-muted); opacity: 0.5; }

        .cr-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .cr-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
        .cr-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .cr-search {
          width: 100%; height: 38px; padding: 0 12px 0 34px;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary);
          font-size: 13px; font-family: inherit;
        }
        .cr-search:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .cr-search::placeholder { color: var(--text-muted); }
        .cr-select {
          height: 38px; padding: 0 10px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit; min-width: 130px;
        }
        .cr-select:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .cr-filter-btn {
          height: 38px; padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .cr-filter-btn:hover { background: var(--color-primary-600); }
        .cr-clear { font-size: 13px; color: var(--text-link); text-decoration: none; padding: 0 4px; }
        .cr-clear:hover { text-decoration: underline; }

        .cr-empty {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 60px 20px; text-align: center;
        }
        .cr-empty-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .cr-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }

        @media (max-width: 640px) {
          .cr-filters { flex-direction: column; }
          .cr-search-wrap { max-width: none; }
        }
      `}</style>
    </section>
  );
}
