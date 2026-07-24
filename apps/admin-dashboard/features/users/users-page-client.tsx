'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { backendFetch } from '../../lib/api/client-api-helpers';
import { AddAdminModal } from './add-admin-modal';
import {
  AdminTable,
  AdminDateCell,
  AdminIdCell,
  AdminStatusBadge,
  AdminPagination,
  AdminFilterBar,
  AdminButton,
  type AdminTableColumn,
} from '../../components/common';
import { usePaginatedResource } from '../../lib/hooks/use-paginated-resource';

type User = {
  id: string;
  email: string | null;
  phone: string | null;
  userType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type UsersPageClientProps = {
  initialUsers: User[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialEmail?: string;
  initialStatus?: string;
  initialUserType?: string;
};

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Deleted', value: 'deleted' },
];

const TYPE_OPTIONS = [
  { label: 'Student', value: 'student' },
  { label: 'Admin', value: 'admin' },
  { label: 'Reviewer', value: 'reviewer' },
  { label: 'Support', value: 'support' },
  { label: 'System', value: 'system' },
];

export function UsersPageClient({
  initialUsers,
  initialTotal,
  initialPage,
  initialLimit,
  initialEmail = '',
  initialStatus = '',
  initialUserType = '',
}: UsersPageClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const fetcher = useCallback(
    async (pg: number, filters: { email: string; status: string; userType: string }) => {
      const qs = new URLSearchParams({ page: String(pg), limit: String(initialLimit) });
      if (filters.email) qs.set('email', filters.email);
      if (filters.status) qs.set('status', filters.status);
      if (filters.userType) qs.set('userType', filters.userType);

      const res = await backendFetch(`/admin/users?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const json = await res.json();
      const data = json?.data ?? json;
      return { data: data.users ?? [], total: data.total ?? 0 };
    },
    [initialLimit]
  );

  const {
    data: users,
    total,
    page,
    loading,
    filters,
    updateFilter,
    setPage,
    reload,
  } = usePaginatedResource<User, { email: string; status: string; userType: string }>({
    initialData: initialUsers,
    initialTotal,
    initialPage,
    initialFilters: { email: initialEmail, status: initialStatus, userType: initialUserType },
    fetcher,
  });

  const columns: AdminTableColumn<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 bg-[var(--surface-raised)] text-[var(--color-primary-600)]">
            {(user.email ?? '?')[0].toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
              {user.email ?? 'No email'}
            </span>
            <AdminIdCell id={user.id} />
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '110px',
      className: 'hidden sm:table-cell',
      render: (user: User) => <AdminStatusBadge status={user.userType} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (user: User) => <AdminStatusBadge status={user.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '130px',
      className: 'hidden md:table-cell',
      render: (user: User) => <AdminDateCell iso={user.createdAt} />,
    },
    {
      key: 'action',
      header: '',
      width: '80px',
      render: (user: User) => (
        <Link
          href={`/admin/users/${user.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary-500)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-500)]">
            User Management
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {total} user{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <AdminButton variant="primary" onClick={() => setShowModal(true)}>
          Add Admin
        </AdminButton>
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        searchValue={filters.email}
        onSearchChange={(val: string) => updateFilter('email', val)}
        searchPlaceholder="Search by email…"
        selectFilters={[
          {
            key: 'status',
            value: filters.status,
            onChange: (val: string) => updateFilter('status', val),
            placeholder: 'All statuses',
            options: STATUS_OPTIONS,
          },
          {
            key: 'userType',
            value: filters.userType,
            onChange: (val: string) => updateFilter('userType', val),
            placeholder: 'All types',
            options: TYPE_OPTIONS,
          },
        ]}
      />

      {/* Table Component */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="font-semibold text-sm text-[var(--text-primary)]">No users found</p>
          <p className="text-xs text-[var(--text-muted)]">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <AdminTable
          columns={columns}
          rows={users}
          getRowKey={(u: User) => u.id}
          onRowClick={(u: User) => router.push(`/admin/users/${u.id}`)}
        />
      )}

      {/* Pagination */}
      <AdminPagination
        currentPage={page}
        totalCount={total}
        pageSize={initialLimit}
        onPageChange={setPage}
      />

      <AddAdminModal open={showModal} onClose={() => { setShowModal(false); reload(); }} />
    </div>
  );
}
