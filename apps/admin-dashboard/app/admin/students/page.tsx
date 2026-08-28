import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../core/auth';
import {
  fetchAdminUsers,
  type AdminUserListItem,
  type AdminUserStatus,
} from '../../../features/users/api/admin-users-api';
import { AdminApiClientError } from '../../../core/api';
import { AdminPageHeader, AdminEmptyState } from '../../../shared/layouts/DashboardLayout';
import {
  AdminTable,
  AdminPagination,
  AdminStatusBadge,
  AdminFilterBar,
  AdminInput,
  AdminSelect,
  AdminDateCell,
  AdminButton,
  type AdminTableColumn,
} from '../../../shared/components/Misc';
import { AdminApiErrorState } from '../../../shared/components/error-handling';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const STATUS_OPTIONS: AdminUserStatus[] = ['active', 'pending', 'disabled', 'deleted'];

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    email?: string;
  }>;
};

const columns: AdminTableColumn<AdminUserListItem>[] = [
  {
    key: 'email',
    header: 'Email',
    render: (user) => user.email ?? <span className="text-[var(--text-muted)]">—</span>,
  },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    render: (user) => <AdminStatusBadge status={user.status} />,
  },
  {
    key: 'createdAt',
    header: 'Enrolled',
    width: '130px',
    render: (user) => <AdminDateCell iso={user.createdAt} />,
  },
  {
    key: 'actions',
    header: '',
    width: '90px',
    render: (user) => (
      <Link href={`/admin/students/${user.id}/progress`} className="no-underline">
        <AdminButton type="button" variant="secondary">
          View
        </AdminButton>
      </Link>
    ),
  },
];

function buildHref(
  page: number,
  params: { limit: number; status?: string; email?: string }
): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.email) qs.set('email', params.email);
  return `/admin/students?${qs.toString()}`;
}

export default async function AdminStudentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(sp.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100
  );
  const status = STATUS_OPTIONS.includes(sp.status as AdminUserStatus)
    ? (sp.status as AdminUserStatus)
    : undefined;
  const email = sp.email?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: { users: AdminUserListItem[]; total: number; page: number; limit: number } | null =
    null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminUsers({ token, page, limit, status, userType: 'student', email });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load students. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Student Management"
        title="Students"
        description={
          data ? `${data.total} student${data.total !== 1 ? 's' : ''} enrolled` : undefined
        }
      />

      <form action="/admin/students" method="GET">
        <AdminFilterBar label="Filter students">
          <AdminInput
            name="email"
            placeholder="Search by email…"
            defaultValue={email ?? ''}
            aria-label="Search by email"
            className="max-w-[240px]"
          />
          <AdminSelect
            name="status"
            defaultValue={status ?? ''}
            aria-label="Filter by status"
            className="max-w-[160px]"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </AdminSelect>
          <input type="hidden" name="limit" value={limit} />
          <AdminButton type="submit" variant="primary">
            Apply
          </AdminButton>
          {(status || email) && (
            <Link
              href={`/admin/students?limit=${limit}`}
              className="text-xs text-[var(--text-link)] hover:underline"
            >
              Clear
            </Link>
          )}
        </AdminFilterBar>
      </form>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.users.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No students found"
          description={
            status || email ? 'Try adjusting the filters above.' : 'No students have enrolled yet.'
          }
        />
      )}

      {data && data.users.length > 0 && (
        <>
          <AdminTable<AdminUserListItem>
            columns={columns}
            rows={data.users}
            getRowKey={(u) => u.id}
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(p, { limit, status, email })}
            label="Student list pagination"
          />
        </>
      )}
    </section>
  );
}
