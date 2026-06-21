// P11-021: Admin courses list page with search, filters, and AIM design system.
// Backend is final authority for course data and status transitions.

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
import {
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminFilterBar,
  AdminInput,
  AdminSelect,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../components/common';
import { AdminPageHeader, AdminEmptyState } from '../../../../components/layout';
import { AdminApiErrorState } from '../../../../components/error-handling';
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

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  in_review: 'warning',
  approved: 'info',
  published: 'success',
  archived: 'error',
};

const columns: AdminTableColumn<AdminCourseSummary>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (course) => (
      <Link href={`/admin/content/courses/${course.id}/status`} style={{ textDecoration: 'none' }}>
        <AdminIdCell id={course.id} />
      </Link>
    ),
  },
  {
    key: 'title',
    header: 'Title',
    render: (course) => course.title,
  },
  {
    key: 'slug',
    header: 'Slug',
    render: (course) =>
      course.slug ? (
        <code style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{course.slug}</code>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>—</span>
      ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (course) => (
      <AdminBadge variant={STATUS_VARIANT[course.status] ?? 'neutral'}>
        {course.status.replace('_', ' ')}
      </AdminBadge>
    ),
  },
  {
    key: 'sortOrder',
    header: 'Order',
    width: '80px',
    render: (course) => String(course.sortOrder),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    render: (course) => <AdminDateCell iso={course.updatedAt} />,
  },
];

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
    data = await fetchAdminCourses({
      token,
      page,
      limit,
      status: statusFilter,
      q: searchQuery,
    });
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
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminCourse(token, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create course.';
      return { error: msg };
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
      await updateAdminCourse(token, id, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update course.';
      return { error: msg };
    }
  }

  return (
    <section className="aim-courses-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <span>Courses</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title="Courses"
        description={data ? `${data.total} course${data.total !== 1 ? 's' : ''} total` : undefined}
      />

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Course records, status, and ordering are
        controlled by backend curriculum APIs.
      </div>

      <form action="/admin/content/courses" method="get">
        <AdminFilterBar>
          <AdminInput
            name="q"
            placeholder="Search courses…"
            defaultValue={searchQuery ?? ''}
            aria-label="Search courses"
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

      {data && data.courses.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No courses found"
          description={
            statusFilter || searchQuery
              ? 'Try adjusting your filters or search query.'
              : 'No courses exist yet. Create the first one.'
          }
        />
      )}

      {data && data.courses.length > 0 && (
        <>
          <AdminTable
            columns={columns}
            rows={data.courses}
            getRowKey={(c) => c.id}
            caption="Courses"
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => {
              const params = new URLSearchParams();
              params.set('page', String(p));
              if (statusFilter) params.set('status', statusFilter);
              if (searchQuery) params.set('q', searchQuery);
              return `/admin/content/courses?${params.toString()}`;
            }}
          />

          <CoursesList
            courses={data.courses}
            total={data.total}
            page={data.page}
            totalPages={totalPages}
            onCreateCourse={handleCreate}
            onUpdateCourse={handleUpdate}
          />
        </>
      )}

      <style>{`
        .aim-courses-page {
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
      `}</style>
    </section>
  );
}
