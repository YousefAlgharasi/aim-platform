import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import {
  fetchAdminUsers,
  type AdminUserListItem,
  type AdminUserStatus,
  type AdminUserType,
} from '../../../lib/api/admin-users-api';
import { AdminApiClientError } from '../../../lib/api';
import { AdminPageHeader } from '../../../components/layout';
import {
  AdminTable,
  AdminPagination,
  AdminStatusBadge,
  AdminBadge,
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
const TYPE_OPTIONS: AdminUserType[] = ['student', 'admin', 'reviewer', 'support', 'system'];

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    userType?: string;
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
    key: 'userType',
    header: 'Type',
    width: '110px',
    render: (user) => <AdminBadge variant="primary">{user.userType}</AdminBadge>,
  },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    render: (user) => <AdminStatusBadge status={user.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    width: '130px',
    render: (user) => <AdminDateCell iso={user.createdAt} />,
  },
];

function buildHref(
  page: number,
  params: { limit: number; status?: string; userType?: string; email?: string },
): string {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.userType) qs.set('userType', params.userType);
  if (params.email) qs.set('email', params.email);
  return `/admin/users?${qs.toString()}`;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(parseInt(sp.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(sp.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    100,
  );
  const status = STATUS_OPTIONS.includes(sp.status as AdminUserStatus)
    ? (sp.status as AdminUserStatus)
    : undefined;
  const userType = TYPE_OPTIONS.includes(sp.userType as AdminUserType)
    ? (sp.userType as AdminUserType)
    : undefined;
  const email = sp.email?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: { users: AdminUserListItem[]; total: number; page: number; limit: number } | null =
    null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminUsers({ token, page, limit, status, userType, email });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load users. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <section>
      <AdminPageHeader
        eyebrow="User Management"
        title="Users"
        description={
          data
            ? `${data.total} user${data.total !== 1 ? 's' : ''} total`
            : undefined
        }
      />

      <form action="/admin/users" method="GET">
        <AdminFilterBar label="Filter users">
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
          <AdminSelect
            name="userType"
            defaultValue={userType ?? ''}
            aria-label="Filter by user type"
            style={{ maxWidth: 160 }}
          >
            <option value="">All types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
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
          {(status || userType || email) && (
            <Link
              href={`/admin/users?limit=${limit}`}
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
          title="No users found"
          description={
            status || userType || email
              ? 'Try adjusting the filters above.'
              : 'No users have been created yet.'
          }
        />
      )}

      {data && data.users.length > 0 && (
        <>
          <AdminTable<AdminUserListItem>
            columns={columns}
            rows={data.users}
            getRowKey={(u) => u.id}
            caption={`Users — page ${data.page} of ${totalPages}`}
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => buildHref(p, { limit, status, userType, email })}
            label="User list pagination"
          />
        </>
      )}
    </section>
  );
}
