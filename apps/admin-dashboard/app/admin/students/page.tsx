import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import {
  fetchAdminUsers,
  type AdminUserListItem,
  type AdminUserStatus,
} from '../../../lib/api/admin-users-api';
import { AdminApiClientError } from '../../../lib/api';
import { AdminPageHeader } from '../../../components/layout';
import {
  AdminTable,
  AdminPagination,
  AdminStatusBadge,
  AdminFilterBar,
  AdminInput,
  AdminSelect,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../components/common';
import { AdminApiErrorState } from '../../../components/error-handling';
import { AdminEmptyState } from '../../../components/layout';

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
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (user) => (
      <Link href={`/admin/users/${user.id}`} style={{ textDecoration: 'none' }}>
        <AdminIdCell id={user.id} />
      </Link>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (user) =>
      user.email ?? <span style={{ color: 'var(--text-muted)' }}>—</span>,
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
    key: 'updatedAt',
    header: 'Last Updated',
    width: '130px',
    render: (user) => <AdminDateCell iso={user.updatedAt} />,
  },
];

function buildHref(
  page: number,
  params: { limit: number; status?: string; email?: string },
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
    100,
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
    <section>
      <AdminPageHeader
        eyebrow="Student Management"
        title="Students"
        description={
          data
            ? `${data.total} student${data.total !== 1 ? 's' : ''} enrolled`
            : undefined
        }
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-16)' }}>
        All student records are sourced from the Backend API. Role enforcement is handled server-side.
      </p>

      <form action="/admin/students" method="GET">
        <AdminFilterBar label="Filter students">
          <AdminInput
            name="email"
            placeholder="Search by email…"
            defaultValue={email ?? ''}
            aria-label="Search by email"
            style={{ maxWidth: 240 }}
          />
          <AdminSelect
            name="status"
            defaultValue={status ?? ''}
            aria-label="Filter by status"
            style={{ maxWidth: 160 }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </AdminSelect>
          <input type="hidden" name="limit" value={limit} />
          <button type="submit" className="aim-filter-submit">
            Apply
            <style>{`
              .aim-filter-submit {
                display: inline-flex;
                align-items: center;
                height: var(--size-input);
                padding: 0 var(--space-16);
                border: none;
                border-radius: var(--radius-sm);
                background: var(--color-primary-600);
                color: var(--text-on-primary);
                font-size: 14px;
                font-weight: var(--weight-medium);
                cursor: pointer;
                transition: background 0.15s;
              }
              .aim-filter-submit:hover { background: var(--color-primary-700); }
              .aim-filter-submit:focus-visible {
                outline: none;
                box-shadow: var(--shadow-focus);
              }
            `}</style>
          </button>
          {(status || email) && (
            <Link
              href={`/admin/students?limit=${limit}`}
              className="aim-filter-clear"
            >
              Clear
              <style>{`
                .aim-filter-clear {
                  font-size: 13px;
                  color: var(--text-link);
                  text-decoration: none;
                }
                .aim-filter-clear:hover { text-decoration: underline; }
              `}</style>
            </Link>
          )}
        </AdminFilterBar>
      </form>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.users.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No students found"
          description={
            status || email
              ? 'Try adjusting the filters above.'
              : 'No students have enrolled yet.'
          }
        />
      )}

      {data && data.users.length > 0 && (
        <>
          <AdminTable<AdminUserListItem>
            columns={columns}
            rows={data.users}
            getRowKey={(u) => u.id}
            caption={`Students — page ${data.page} of ${totalPages}`}
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
