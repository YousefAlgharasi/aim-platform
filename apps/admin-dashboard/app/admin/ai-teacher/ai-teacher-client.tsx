'use client';

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
} from '../../../lib/api/admin-ai-teacher-api';

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
};

const promptColumns: AdminTableColumn<AdminAiPromptTemplateItem>[] = [
  { key: 'name', header: 'Name', render: (row) => <span style={{ fontSize: '13px' }}>{row.name}</span> },
  { key: 'version', header: 'Version', render: (row) => <span>{row.version}</span> },
  { key: 'locale', header: 'Locale', render: (row) => <span>{row.locale}</span> },
  { key: 'audience', header: 'Audience', render: (row) => <span>{row.audience}</span> },
  { key: 'status', header: 'Status', render: (row) => <AdminBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</AdminBadge> },
  { key: 'updatedAt', header: 'Updated', render: (row) => <AdminDateCell date={row.updatedAt} /> },
];

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

export function AiTeacherClient({ section, rows }: Props) {
  const router = useRouter();

  function goToSection(next: AiTeacherSection) {
    router.push(`?section=${next}`);
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
