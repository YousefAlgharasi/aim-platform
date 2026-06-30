'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  AdminBroadcastItem,
  CreateBroadcastPayload,
} from '../../../lib/api/admin-notifications-api';
import { BroadcastForm } from './broadcast-form';

export type NotificationsSection = 'broadcasts' | 'templates' | 'queue' | 'schedules' | 'preferences' | 'audit-logs';

const TABS: { key: NotificationsSection; label: string }[] = [
  { key: 'broadcasts', label: 'Broadcasts' },
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
  readonly onCreateBroadcast: (payload: CreateBroadcastPayload) => Promise<{ error?: string }>;
  readonly onRunBroadcast: (id: string) => Promise<{ error?: string }>;
  readonly onDisableBroadcast: (id: string) => Promise<{ error?: string }>;
  readonly onEnableBroadcast: (id: string) => Promise<{ error?: string }>;
  readonly onDeleteBroadcast: (id: string) => Promise<{ error?: string }>;
};

const templateColumns: AdminTableColumn<AdminNotificationTemplateItem>[] = [
  { key: 'key', header: 'Key', render: (row) => <span style={{ fontSize: '13px' }}>{row.key}</span> },
  { key: 'channel', header: 'Channel', render: (row) => <AdminBadge variant="default">{row.channel}</AdminBadge> },
  { key: 'locale', header: 'Locale', render: (row) => <span>{row.locale}</span> },
  { key: 'category', header: 'Category', render: (row) => <span>{row.category}</span> },
  { key: 'status', header: 'Status', render: (row) => <AdminBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</AdminBadge> },
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

function statusBadgeVariant(status: string) {
  if (status === 'active') return 'success' as const;
  if (status === 'disabled') return 'warning' as const;
  if (status === 'sent') return 'info' as const;
  return 'default' as const;
}

export function NotificationsClient({
  section,
  rows,
  total,
  page,
  totalPages,
  filterStatus,
  filterActorId,
  filterAction,
  onCreateBroadcast,
  onRunBroadcast,
  onDisableBroadcast,
  onEnableBroadcast,
  onDeleteBroadcast,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(filterStatus);
  const [actorId, setActorId] = useState(filterActorId);
  const [action, setAction] = useState(filterAction);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function goToSection(next: NotificationsSection) {
    setShowBroadcastForm(false);
    setActionError(null);
    router.push(`?section=${next}&page=1`);
  }

  function refresh() {
    router.refresh();
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

  async function handleCreateBroadcast(payload: CreateBroadcastPayload) {
    const result = await onCreateBroadcast(payload);
    if (!result.error) {
      setShowBroadcastForm(false);
      refresh();
    }
    return result;
  }

  function handleRun(id: string) {
    setActionError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await onRunBroadcast(id);
      setPendingId(null);
      if (result.error) setActionError(result.error);
      else refresh();
    });
  }

  function handleDisable(id: string) {
    setActionError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await onDisableBroadcast(id);
      setPendingId(null);
      if (result.error) setActionError(result.error);
      else refresh();
    });
  }

  function handleEnable(id: string) {
    setActionError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await onEnableBroadcast(id);
      setPendingId(null);
      if (result.error) setActionError(result.error);
      else refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this broadcast schedule?')) return;
    setActionError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await onDeleteBroadcast(id);
      setPendingId(null);
      if (result.error) setActionError(result.error);
      else refresh();
    });
  }

  const broadcastColumns: AdminTableColumn<AdminBroadcastItem>[] = [
    { key: 'title', header: 'Title', render: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span> },
    { key: 'channel', header: 'Channel', render: (row) => <AdminBadge variant="default">{row.channel.replace('_', '-')}</AdminBadge> },
    { key: 'audience', header: 'Audience', render: (row) => <AdminBadge variant="info">{row.audience}</AdminBadge> },
    { key: 'schedule', header: 'Schedule', render: (row) => <AdminBadge variant="default">{row.schedule}</AdminBadge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AdminBadge variant={statusBadgeVariant(row.status)}>{row.status}</AdminBadge>,
    },
    {
      key: 'sentCount',
      header: 'Sent',
      render: (row) => <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{row.sentCount.toLocaleString()}</span>,
    },
    { key: 'nextRunAt', header: 'Next Run', render: (row) => row.nextRunAt ? <AdminDateCell date={row.nextRunAt} /> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'lastRunAt', header: 'Last Run', render: (row) => row.lastRunAt ? <AdminDateCell date={row.lastRunAt} /> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'nowrap' }}>
          {row.schedule !== 'once' && row.status !== 'sent' && (
            <AdminButton
              size="sm"
              variant="secondary"
              onClick={() => handleRun(row.id)}
              disabled={isPending && pendingId === row.id}
            >
              Run now
            </AdminButton>
          )}
          {row.status === 'active' && row.schedule !== 'once' && (
            <AdminButton
              size="sm"
              variant="secondary"
              onClick={() => handleDisable(row.id)}
              disabled={isPending && pendingId === row.id}
            >
              Disable
            </AdminButton>
          )}
          {row.status === 'disabled' && (
            <AdminButton
              size="sm"
              variant="primary"
              onClick={() => handleEnable(row.id)}
              disabled={isPending && pendingId === row.id}
            >
              Enable
            </AdminButton>
          )}
          <AdminButton
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.id)}
            disabled={isPending && pendingId === row.id}
          >
            Delete
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
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
        {section === 'broadcasts' && !showBroadcastForm && (
          <AdminButton variant="primary" size="sm" onClick={() => setShowBroadcastForm(true)}>
            + New Broadcast
          </AdminButton>
        )}
      </div>

      {section === 'broadcasts' && showBroadcastForm && (
        <BroadcastForm onSubmit={handleCreateBroadcast} onDone={() => setShowBroadcastForm(false)} />
      )}

      {actionError && (
        <p className="admin-error-banner" role="alert">{actionError}</p>
      )}

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
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {section === 'broadcasts' ? 'No broadcasts yet. Click "+ New Broadcast" to send your first one.' : 'No entries match the current filters.'}
        </p>
      ) : (
        <>
          {section === 'broadcasts' && (
            <AdminTable
              columns={broadcastColumns}
              rows={rows as AdminBroadcastItem[]}
              getRowKey={(row) => row.id}
              caption={`${total} broadcast schedules`}
            />
          )}
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
