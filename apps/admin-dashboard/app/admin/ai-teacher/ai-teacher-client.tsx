'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminTable,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
  AdminButton,
} from '../../../components/common';
import type { AdminTableColumn } from '../../../components/common';
import type {
  AdminAiPromptTemplateItem,
  AdminAiModelConfigItem,
  AdminAiSafetyEventItem,
  AdminAiUsageCostItem,
  AdminAiAuditLogItem,
  CreatePromptTemplateDraftPayload,
} from '../../../lib/api/admin-ai-teacher-api';
import { PromptDraftForm } from './prompt-draft-form';

export type AiTeacherSection = 'prompts' | 'model-configs' | 'safety' | 'usage' | 'audit-logs';

const TABS: { key: AiTeacherSection; label: string }[] = [
  { key: 'prompts', label: 'Prompt Templates' },
  { key: 'model-configs', label: 'Model Configuration' },
  { key: 'safety', label: 'Safety & Content Filtering' },
  { key: 'usage', label: 'Usage & Cost Tracking' },
  { key: 'audit-logs', label: 'AI Audit Logs' },
];

type Props = {
  readonly section: AiTeacherSection;
  readonly rows: readonly unknown[];
  readonly onCreateDraft: (payload: CreatePromptTemplateDraftPayload) => Promise<{ error?: string }>;
  readonly onPublish: (id: string) => Promise<{ error?: string }>;
  readonly onRetire: (id: string) => Promise<{ error?: string }>;
};

function buildPromptColumns(
  onPublish: (row: AdminAiPromptTemplateItem) => void,
  onRetire: (row: AdminAiPromptTemplateItem) => void,
  pendingId: string | null,
): AdminTableColumn<AdminAiPromptTemplateItem>[] {
  return [
    { key: 'name', header: 'Name', render: (row) => <span style={{ fontSize: '13px' }}>{row.name}</span> },
    { key: 'version', header: 'Version', render: (row) => <span>{row.version}</span> },
    { key: 'locale', header: 'Locale', render: (row) => <span>{row.locale}</span> },
    { key: 'audience', header: 'Audience', render: (row) => <span>{row.audience}</span> },
    { key: 'status', header: 'Status', render: (row) => <AdminBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</AdminBadge> },
    { key: 'updatedAt', header: 'Updated', render: (row) => <AdminDateCell date={row.updatedAt} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          {row.status === 'draft' && (
            <AdminButton size="sm" variant="primary" disabled={pendingId === row.id} onClick={() => onPublish(row)}>
              Publish
            </AdminButton>
          )}
          {row.status === 'active' && (
            <AdminButton size="sm" variant="destructive" disabled={pendingId === row.id} onClick={() => onRetire(row)}>
              Retire
            </AdminButton>
          )}
        </div>
      ),
    },
  ];
}

const modelConfigColumns: AdminTableColumn<AdminAiModelConfigItem>[] = [
  { key: 'name', header: 'Name', render: (row) => <span style={{ fontSize: '13px' }}>{row.name}</span> },
  { key: 'modelId', header: 'Model', render: (row) => <span style={{ fontSize: '13px' }}>{row.modelId}</span> },
  { key: 'tier', header: 'Tier', render: (row) => <AdminBadge variant="default">{row.tier}</AdminBadge> },
  { key: 'providerKeyRef', header: 'Provider Key Ref', render: (row) => <span style={{ fontSize: '12px' }}>{row.providerKeyRef}</span> },
  { key: 'status', header: 'Status', render: (row) => <AdminBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</AdminBadge> },
  { key: 'updatedAt', header: 'Updated', render: (row) => <AdminDateCell date={row.updatedAt} /> },
];

const safetyColumns: AdminTableColumn<AdminAiSafetyEventItem>[] = [
  { key: 'id', header: 'Event ID', render: (row) => <AdminIdCell id={row.id} /> },
  { key: 'targetType', header: 'Target Type', render: (row) => <span>{row.targetType}</span> },
  { key: 'category', header: 'Category', render: (row) => <AdminBadge variant="default">{row.category.replace(/_/g, ' ')}</AdminBadge> },
  { key: 'severity', header: 'Severity', render: (row) => <AdminBadge variant={row.severity === 'high' || row.severity === 'critical' ? 'error' : 'default'}>{row.severity}</AdminBadge> },
  { key: 'action', header: 'Action', render: (row) => <AdminBadge variant="default">{row.action}</AdminBadge> },
  { key: 'createdAt', header: 'Time', render: (row) => <AdminDateCell date={row.createdAt} /> },
];

const usageColumns: AdminTableColumn<AdminAiUsageCostItem>[] = [
  { key: 'id', header: 'Event ID', render: (row) => <AdminIdCell id={row.id} /> },
  { key: 'studentId', header: 'Student', render: (row) => <AdminIdCell id={row.studentId} /> },
  { key: 'eventType', header: 'Event Type', render: (row) => <AdminBadge variant="default">{row.eventType.replace(/_/g, ' ')}</AdminBadge> },
  { key: 'tokensUsed', header: 'Tokens', render: (row) => <span>{row.tokensUsed ?? '—'}</span> },
  { key: 'costEstimate', header: 'Cost (USD)', render: (row) => <span>{row.costEstimate}</span> },
  { key: 'quotaPeriod', header: 'Quota Period', render: (row) => <span>{row.quotaPeriod}</span> },
  { key: 'createdAt', header: 'Time', render: (row) => <AdminDateCell date={row.createdAt} /> },
];

const auditColumns: AdminTableColumn<AdminAiAuditLogItem>[] = [
  { key: 'id', header: 'Log ID', render: (row) => <AdminIdCell id={row.id} /> },
  { key: 'actorId', header: 'Actor', render: (row) => row.actorId ? <AdminIdCell id={row.actorId} /> : <span>—</span> },
  { key: 'action', header: 'Action', render: (row) => <AdminBadge variant="default">{row.action.replace(/_/g, ' ')}</AdminBadge> },
  { key: 'resourceType', header: 'Resource Type', render: (row) => <span style={{ fontSize: '13px' }}>{row.resourceType}</span> },
  { key: 'resourceId', header: 'Resource ID', render: (row) => row.resourceId ? <AdminIdCell id={row.resourceId} /> : <span>—</span> },
  { key: 'createdAt', header: 'Time', render: (row) => <AdminDateCell date={row.createdAt} /> },
];

export function AiTeacherClient({ section, rows, onCreateDraft, onPublish, onRetire }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function goToSection(next: AiTeacherSection) {
    setShowCreate(false);
    setActionError(null);
    router.push(`?section=${next}`);
  }

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleCreateDraft(payload: CreatePromptTemplateDraftPayload) {
    const result = await onCreateDraft(payload);
    if (!result.error) refresh();
    return result;
  }

  async function handlePublish(row: AdminAiPromptTemplateItem) {
    setActionError(null);
    setPendingId(row.id);
    const result = await onPublish(row.id);
    setPendingId(null);
    if (result.error) {
      setActionError(result.error);
    } else {
      refresh();
    }
  }

  async function handleRetire(row: AdminAiPromptTemplateItem) {
    setActionError(null);
    setPendingId(row.id);
    const result = await onRetire(row.id);
    setPendingId(null);
    if (result.error) {
      setActionError(result.error);
    } else {
      refresh();
    }
  }

  const promptColumns = buildPromptColumns(handlePublish, handleRetire, pendingId);

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

      {section === 'prompts' && (
        <div>
          {!showCreate && (
            <AdminButton size="sm" variant="primary" onClick={() => setShowCreate(true)}>
              New Prompt Draft
            </AdminButton>
          )}
        </div>
      )}

      {section === 'prompts' && showCreate && (
        <PromptDraftForm onSubmit={handleCreateDraft} onDone={() => setShowCreate(false)} />
      )}

      {actionError && (
        <p className="admin-error-banner" role="alert">{actionError}</p>
      )}

      {rows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No entries to display for this section.</p>
      ) : (
        <>
          {section === 'prompts' && (
            <AdminTable
              columns={promptColumns}
              rows={rows as AdminAiPromptTemplateItem[]}
              getRowKey={(row) => row.id}
              caption={`${rows.length} prompt template versions`}
            />
          )}
          {section === 'model-configs' && (
            <AdminTable
              columns={modelConfigColumns}
              rows={rows as AdminAiModelConfigItem[]}
              getRowKey={(row) => row.id}
              caption={`${rows.length} model configs`}
            />
          )}
          {section === 'safety' && (
            <AdminTable
              columns={safetyColumns}
              rows={rows as AdminAiSafetyEventItem[]}
              getRowKey={(row) => row.id}
              caption={`${rows.length} rejected safety events`}
            />
          )}
          {section === 'usage' && (
            <AdminTable
              columns={usageColumns}
              rows={rows as AdminAiUsageCostItem[]}
              getRowKey={(row) => row.id}
              caption={`${rows.length} usage/cost events`}
            />
          )}
          {section === 'audit-logs' && (
            <AdminTable
              columns={auditColumns}
              rows={rows as AdminAiAuditLogItem[]}
              getRowKey={(row) => row.id}
              caption={`${rows.length} audit log entries`}
            />
          )}
        </>
      )}
    </div>
  );
}
