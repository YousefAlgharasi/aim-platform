'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
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
import { useAdminUsersQuery, USER_QUERY_KEYS } from './hooks/use-users-query';
import type { AdminUserListItem, FetchAdminUsersParams } from './admin-users-api';

type UsersPageClientProps = {
  initialUsers: AdminUserListItem[];
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
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    email: initialEmail,
    status: initialStatus,
    userType: initialUserType,
  });

  const isInitialState =
    page === initialPage &&
    filters.email === initialEmail &&
    filters.status === initialStatus &&
    filters.userType === initialUserType;

  const queryParams: FetchAdminUsersParams = {
    page,
    limit: initialLimit,
    ...(filters.email ? { email: filters.email } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.userType ? { userType: filters.userType } : {}),
  };

  const { data, isLoading, refetch } = useAdminUsersQuery(queryParams, {
    initialData: isInitialState
      ? { users: initialUsers, total: initialTotal, page: initialPage, limit: initialLimit }
      : undefined,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? initialTotal;

  const updateFilter = (key: 'email' | 'status' | 'userType', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const columns: AdminTableColumn<AdminUserListItem>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user: AdminUserListItem) => (
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
      render: (user: AdminUserListItem) => <AdminStatusBadge status={user.userType} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (user: AdminUserListItem) => <AdminStatusBadge status={user.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '130px',
      className: 'hidden md:table-cell',
      render: (user: AdminUserListItem) => <AdminDateCell iso={user.createdAt} />,
    },
    {
      key: 'action',
      header: '',
      width: '80px',
      render: (user: AdminUserListItem) => (
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
      {isLoading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
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
          getRowKey={(u: AdminUserListItem) => u.id}
          onRowClick={(u: AdminUserListItem) => router.push(`/admin/users/${u.id}`)}
        />
      )}

      {/* Pagination */}
      <AdminPagination
        currentPage={page}
        totalCount={total}
        pageSize={initialLimit}
        onPageChange={setPage}
      />

      <AddAdminModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
          refetch();
        }}
      />
    </div>
  );
}
