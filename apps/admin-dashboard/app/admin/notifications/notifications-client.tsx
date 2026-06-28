'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AdminTable,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
  AdminPagination,
  AdminInput,
  AdminButton,
  AdminCard,
} from '../../../components/common';
import type { AdminTableColumn } from '../../../components/common';
import type {
  AdminNotificationTemplateItem,
  AdminNotificationEventItem,
  AdminReminderScheduleItem,
  AdminNotificationPreferenceItem,
  AdminNotificationAuditLogItem,
} from '../../../lib/api/admin-notifications-api';

export type NotificationsSection = 'templates' | 'queue' | 'schedules' | 'preferences' | 'audit-logs';

const TABS: { key: NotificationsSection; label: string }[] = [
  { key: 'templates', label: 'Templates' },
  { key: 'queue', label: 'Delivery Queue' },
  { key: 'schedules', label: 'Reminder Schedules' },
  { key: 'preferences', label: 'User Preferences' },
  { key: 'audit-logs', label: 'Audit Log' },
];

type Props = {
  readonly section: NotificationsSection;
  readonly rows: readonly unknown[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterStatus: string;
  readonly filterActorId: string;
  readonly filterAction: string;
};

const templateColumns: AdminTableColumn<AdminNotificationTemplateItem>[] = [
  { key: 'key', header: 'Key', render: (row) => <span style={{ fontSize: '13px' }}>{row.key}</span> },
  { key: 'channel', header: 'Channel', render: (row) => <AdminBadge variant="default">{row.channel}</AdminBadge> },
  { key: 'locale', header: 'Locale', render: (row) => <span>{row.locale}</span> },
  { key: 'category', header: 'Category', render: (row) => <span>{row.category}</span> },
  { key: 'status', header: 'Status', render: (row) => <AdminBadge variant="default">{row.status}</AdminBadge> },
  { key: 'updatedAt', header: 'Updated', render: (row) => <AdminDateCell date={row.updatedAt} /> },
];

const queueColumns: AdminTableColumn<AdminNotificationEventItem>[] = [
  { key: 'id', header: 'Event ID', render: (row) => <AdminIdCell id={row.id} /> },
  { key: 'recipientId', header: 'Recipient', render: (row) => <AdminIdCell id={row.recipientId} /> },
  { key: 'category', header: 'Category', render: (row) => <span>{row.category}</span> },
  { key: 'channel', header: 'Channel', render: (row) => <AdminBadge variant="default">{row.channel}</AdminBadge> },
  { key: 'state', header: 'State', render: (row) => <AdminBadge variant="default">{row.state}</AdminBadge> },
  { key: 'createdAt', header: 'Created', render: (row) => <AdminDateCell date={row.createdAt} /> },
];

const scheduleColumns: AdminTableColumn<AdminReminderScheduleItem>[] = [
  { key: 'id', header: 'Schedule ID', render: (row) => <AdminIdCell id={row.id} /> },
  { key: 'ownerId', header: 'Owner', render: (row) => <AdminIdCell id={row.ownerId} /> },
  { key: 'kind', header: 'Kind', render: (row) => <AdminBadge variant="default">{row.kind.replace(/_/g, ' ')}</AdminBadge> },
  { key: 'cadence', header: 'Cadence', render: (row) => <span style={{ fontSize: '12px' }}>{row.cadence}</span> },
  { key: 'nextRunAt', header: 'Next Run', render: (row) => <AdminDateCell date={row.nextRunAt} /> },
  { key: 'status', header: 'Status', render: (row) => <AdminBadge variant="default">{row.status}</AdminBadge> },
];

const preferenceColumns: AdminTableColumn<AdminNotificationPreferenceItem>[] = [
  { key: 'userId', header: 'User ID', render: (row) => <AdminIdCell id={row.userId} /> },
  { key: 'userType', header: 'User Type', render: (row) => <span>{row.userType}</span> },
  { key: 'channel', header: 'Channel', render: (row) => <AdminBadge variant="default">{row.channel}</AdminBadge> },
  { key: 'category', header: 'Category', render: (row) => <span>{row.category}</span> },
  {
    key: 'enabled',
    header: 'Enabled',
    render: (row) => <AdminBadge variant={row.enabled ? 'success' : 'default'}>{row.enabled ? 'enabled' : 'disabled'}</AdminBadge>,
  },
];

const auditColumns: AdminTableColumn<AdminNotificationAuditLogItem>[] = [
  { key: 'id', header: 'Log ID', render: (row) => <AdminIdCell id={row.id} /> },
  { key: 'actorId', header: 'Actor', render: (row) => row.actorId ? <AdminIdCell id={row.actorId} /> : <span>—</span> },
  { key: 'action', header: 'Action', render: (row) => <AdminBadge variant="default">{row.action.replace(/_/g, ' ')}</AdminBadge> },
  { key: 'entityType', header: 'Entity Type', render: (row) => <span style={{ fontSize: '13px' }}>{row.entityType}</span> },
  { key: 'entityId', header: 'Entity ID', render: (row) => <AdminIdCell id={row.entityId} /> },
  { key: 'createdAt', header: 'Time', render: (row) => <AdminDateCell date={row.createdAt} /> },
];

export function NotificationsClient({
  section,
  rows,
  total,
  page,
  totalPages,
  filterStatus,
  filterActorId,
  filterAction,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(filterStatus);
  const [actorId, setActorId] = useState(filterActorId);
  const [action, setAction] = useState(filterAction);

  function goToSection(next: NotificationsSection) {
    router.push(`?section=${next}&page=1`);
  }

  function applyFilters() {
    const params = new URLSearchParams();
    params.set('section', section);
    params.set('page', '1');
    if (section === 'schedules' && status) params.set('status', status);
    if (section === 'audit-logs' && actorId) params.set('actorId', actorId);
    if (section === 'audit-logs' && action) params.set('action', action);
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    setStatus('');
    setActorId('');
    setAction('');
    router.push(`?section=${section}&page=1`);
  }

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set('section', section);
    params.set('page', String(p));
    if (section === 'schedules' && filterStatus) params.set('status', filterStatus);
    if (section === 'audit-logs' && filterActorId) params.set('actorId', filterActorId);
    if (section === 'audit-logs' && filterAction) params.set('action', filterAction);
    return `?${params.toString()}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <AdminButton
            key={tab.key}
            onClick={() => goToSection(tab.key)}
            variant={tab.key === section ? 'primary' : 'secondary'}
            size="sm"
          >
            {tab.label}
          </AdminButton>
        ))}
      </div>

      {section === 'schedules' && (
        <AdminCard title="Filters">
          <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>Status</label>
              <AdminInput value={status} onChange={(e) => setStatus(e.target.value)} placeholder="active, cancelled..." />
            </div>
            <AdminButton onClick={applyFilters} variant="primary" size="sm">Apply</AdminButton>
            <AdminButton onClick={clearFilters} variant="secondary" size="sm">Clear</AdminButton>
          </div>
        </AdminCard>
      )}

      {section === 'audit-logs' && (
        <AdminCard title="Filters">
          <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>Actor ID</label>
              <AdminInput value={actorId} onChange={(e) => setActorId(e.target.value)} placeholder="Filter by actor ID" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>Action</label>
              <AdminInput value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter by action" />
            </div>
            <AdminButton onClick={applyFilters} variant="primary" size="sm">Apply</AdminButton>
            <AdminButton onClick={clearFilters} variant="secondary" size="sm">Clear</AdminButton>
          </div>
        </AdminCard>
      )}

      {rows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No entries match the current filters.</p>
      ) : (
        <>
          {section === 'templates' && (
            <AdminTable
              columns={templateColumns}
              rows={rows as AdminNotificationTemplateItem[]}
              getRowKey={(row) => row.id}
              caption={`${total} templates`}
            />
          )}
          {section === 'queue' && (
            <AdminTable
              columns={queueColumns}
              rows={rows as AdminNotificationEventItem[]}
              getRowKey={(row) => row.id}
              caption={`${total} queued events`}
            />
          )}
          {section === 'schedules' && (
            <AdminTable
              columns={scheduleColumns}
              rows={rows as AdminReminderScheduleItem[]}
              getRowKey={(row) => row.id}
              caption={`${total} reminder schedules`}
            />
          )}
          {section === 'preferences' && (
            <AdminTable
              columns={preferenceColumns}
              rows={rows as AdminNotificationPreferenceItem[]}
              getRowKey={(row) => row.id}
              caption={`${total} preferences`}
            />
          )}
          {section === 'audit-logs' && (
            <AdminTable
              columns={auditColumns}
              rows={rows as AdminNotificationAuditLogItem[]}
              getRowKey={(row) => row.id}
              caption={`${total} audit log entries`}
            />
          )}
          {totalPages > 1 && (
            <AdminPagination page={page} totalPages={totalPages} buildHref={buildHref} />
          )}
        </>
      )}
    </div>
  );
}
