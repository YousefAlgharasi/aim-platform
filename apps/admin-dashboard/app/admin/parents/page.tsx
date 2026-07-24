'use client';

import { useState, useEffect, useCallback } from 'react';
import { backendFetch } from '../../../lib/api/client-api-helpers';
import {
  AdminTable,
  AdminPagination,
  AdminStatusBadge,
  AdminFilterBar,
  AdminCard,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../components/common';
import { usePaginatedResource } from '../../../lib/hooks/use-paginated-resource';

type Tab = 'links' | 'invitations' | 'consents';

type Stats = {
  totalLinks: number;
  activeLinks: number;
  pendingLinks: number;
  revokedLinks: number;
  totalInvitations: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  expiredInvitations: number;
  totalConsents: number;
  grantedConsents: number;
  revokedConsents: number;
};

type LinkItem = {
  id: string;
  parentId: string;
  parentEmail: string | null;
  childId: string;
  childEmail: string | null;
  relationshipType: string;
  status: string;
  linkedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type Invitation = {
  id: string;
  parentId: string;
  parentEmail: string | null;
  childEmail: string | null;
  childId: string | null;
  relationshipType: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

type Consent = {
  id: string;
  parentChildLinkId: string;
  parentEmail: string | null;
  childEmail: string | null;
  consentType: string;
  status: string;
  grantedAt: string;
  revokedAt: string | null;
};

const LINK_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Revoked', value: 'revoked' },
];

const INV_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
];

const CONSENT_STATUSES = [
  { label: 'Granted', value: 'granted' },
  { label: 'Revoked', value: 'revoked' },
];

const CONSENT_TYPES = [
  { label: 'Progress View', value: 'progress_view' },
  { label: 'Assessment View', value: 'assessment_view' },
  { label: 'Activity View', value: 'activity_view' },
  { label: 'Report View', value: 'report_view' },
  { label: 'Full Access', value: 'full_access' },
];

export default function AdminParentsPage() {
  const [tab, setTab] = useState<Tab>('links');
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await backendFetch('/admin/parents/stats');
      if (res.ok) {
        const json = await res.json();
        setStats(json?.data ?? json);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Links resource
  const linksFetcher = useCallback(
    async (pg: number, filters: { status: string; search: string }) => {
      const qs = new URLSearchParams({ page: String(pg), limit: '20' });
      if (filters.status) qs.set('status', filters.status);
      if (filters.search) qs.set('search', filters.search);
      const res = await backendFetch(`/admin/parents/links?${qs}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const d = json?.data ?? json;
      return { data: d.links ?? [], total: d.total ?? 0 };
    },
    []
  );

  const linksResource = usePaginatedResource<LinkItem, { status: string; search: string }>({
    initialFilters: { status: '', search: '' },
    fetcher: linksFetcher,
  });

  // Invitations resource
  const invFetcher = useCallback(
    async (pg: number, filters: { status: string; search: string }) => {
      const qs = new URLSearchParams({ page: String(pg), limit: '20' });
      if (filters.status) qs.set('status', filters.status);
      if (filters.search) qs.set('search', filters.search);
      const res = await backendFetch(`/admin/parents/invitations?${qs}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const d = json?.data ?? json;
      return { data: d.invitations ?? [], total: d.total ?? 0 };
    },
    []
  );

  const invResource = usePaginatedResource<Invitation, { status: string; search: string }>({
    initialFilters: { status: '', search: '' },
    fetcher: invFetcher,
  });

  // Consents resource
  const consentFetcher = useCallback(
    async (pg: number, filters: { status: string; consentType: string }) => {
      const qs = new URLSearchParams({ page: String(pg), limit: '20' });
      if (filters.status) qs.set('status', filters.status);
      if (filters.consentType) qs.set('consentType', filters.consentType);
      const res = await backendFetch(`/admin/parents/consents?${qs}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const d = json?.data ?? json;
      return { data: d.consents ?? [], total: d.total ?? 0 };
    },
    []
  );

  const consentResource = usePaginatedResource<Consent, { status: string; consentType: string }>({
    initialFilters: { status: '', consentType: '' },
    fetcher: consentFetcher,
  });

  const linkColumns: AdminTableColumn<LinkItem>[] = [
    {
      key: 'parent',
      header: 'Parent',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-[var(--text-primary)]">
            {item.parentEmail ?? 'Unknown'}
          </span>
          <AdminIdCell id={item.parentId} />
        </div>
      ),
    },
    {
      key: 'child',
      header: 'Child',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-[var(--text-primary)]">
            {item.childEmail ?? 'Unknown'}
          </span>
          <AdminIdCell id={item.childId} />
        </div>
      ),
    },
    {
      key: 'relationship',
      header: 'Relationship',
      width: '120px',
      render: (item) => <AdminStatusBadge status={item.relationshipType} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (item) => <AdminStatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '130px',
      render: (item) => <AdminDateCell iso={item.createdAt} />,
    },
  ];

  const invColumns: AdminTableColumn<Invitation>[] = [
    {
      key: 'parent',
      header: 'Parent Email',
      render: (item) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">
          {item.parentEmail ?? '—'}
        </span>
      ),
    },
    {
      key: 'child',
      header: 'Child Email',
      render: (item) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">
          {item.childEmail ?? '—'}
        </span>
      ),
    },
    {
      key: 'relationship',
      header: 'Relationship',
      width: '120px',
      render: (item) => <AdminStatusBadge status={item.relationshipType} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (item) => <AdminStatusBadge status={item.status} />,
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      width: '130px',
      render: (item) => <AdminDateCell iso={item.expiresAt} />,
    },
  ];

  const consentColumns: AdminTableColumn<Consent>[] = [
    {
      key: 'parent',
      header: 'Parent Email',
      render: (item) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">
          {item.parentEmail ?? '—'}
        </span>
      ),
    },
    {
      key: 'child',
      header: 'Child Email',
      render: (item) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">
          {item.childEmail ?? '—'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Consent Type',
      render: (item) => (
        <code className="text-xs px-2 py-0.5 rounded bg-[var(--surface-sunken)] font-mono">
          {item.consentType.replace(/_/g, ' ')}
        </code>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (item) => <AdminStatusBadge status={item.status} />,
    },
    {
      key: 'grantedAt',
      header: 'Granted Date',
      width: '130px',
      render: (item) => <AdminDateCell iso={item.grantedAt} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Parent Portal Management</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Monitor parent-child links, invitations, and parental consent settings.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminCard className="p-4">
            <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">Total Links</p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{stats.totalLinks}</p>
            <p className="text-xs text-[var(--color-success-600)] mt-1">{stats.activeLinks} active</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">Total Invitations</p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{stats.totalInvitations}</p>
            <p className="text-xs text-[var(--color-warning-600)] mt-1">{stats.pendingInvitations} pending</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">Total Consents</p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{stats.totalConsents}</p>
            <p className="text-xs text-[var(--color-success-600)] mt-1">{stats.grantedConsents} granted</p>
          </AdminCard>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-6">
        {(['links', 'invitations', 'consents'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
              tab === t
                ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {tab === 'links' && (
        <div className="flex flex-col gap-4">
          <AdminFilterBar
            searchValue={linksResource.filters.search}
            onSearchChange={(val) => linksResource.updateFilter('search', val)}
            searchPlaceholder="Search parent or child email…"
            selectFilters={[
              {
                key: 'status',
                value: linksResource.filters.status,
                onChange: (val) => linksResource.updateFilter('status', val),
                placeholder: 'All statuses',
                options: LINK_STATUSES,
              },
            ]}
          />
          <AdminTable
            columns={linkColumns}
            rows={linksResource.data}
            getRowKey={(item) => item.id}
          />
          <AdminPagination
            currentPage={linksResource.page}
            totalCount={linksResource.total}
            pageSize={20}
            onPageChange={linksResource.setPage}
          />
        </div>
      )}

      {tab === 'invitations' && (
        <div className="flex flex-col gap-4">
          <AdminFilterBar
            searchValue={invResource.filters.search}
            onSearchChange={(val) => invResource.updateFilter('search', val)}
            searchPlaceholder="Search parent or child email…"
            selectFilters={[
              {
                key: 'status',
                value: invResource.filters.status,
                onChange: (val) => invResource.updateFilter('status', val),
                placeholder: 'All statuses',
                options: INV_STATUSES,
              },
            ]}
          />
          <AdminTable
            columns={invColumns}
            rows={invResource.data}
            getRowKey={(item) => item.id}
          />
          <AdminPagination
            currentPage={invResource.page}
            totalCount={invResource.total}
            pageSize={20}
            onPageChange={invResource.setPage}
          />
        </div>
      )}

      {tab === 'consents' && (
        <div className="flex flex-col gap-4">
          <AdminFilterBar
            selectFilters={[
              {
                key: 'status',
                value: consentResource.filters.status,
                onChange: (val) => consentResource.updateFilter('status', val),
                placeholder: 'All statuses',
                options: CONSENT_STATUSES,
              },
              {
                key: 'consentType',
                value: consentResource.filters.consentType,
                onChange: (val) => consentResource.updateFilter('consentType', val),
                placeholder: 'All types',
                options: CONSENT_TYPES,
              },
            ]}
          />
          <AdminTable
            columns={consentColumns}
            rows={consentResource.data}
            getRowKey={(item) => item.id}
          />
          <AdminPagination
            currentPage={consentResource.page}
            totalCount={consentResource.total}
            pageSize={20}
            onPageChange={consentResource.setPage}
          />
        </div>
      )}
    </div>
  );
}
