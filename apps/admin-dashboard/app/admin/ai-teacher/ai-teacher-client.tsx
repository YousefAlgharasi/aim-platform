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
  const [searchQuery, setSearchQuery] = useState('');
  const [, startTransition] = useTransition();

  function goToSection(next: AiTeacherSection) {
    setShowCreate(false);
    setActionError(null);
    setSearchQuery('');
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
  const currentTab = TABS.find((tab) => tab.key === section);

  const statusCounts = section === 'prompts' || section === 'model-configs'
    ? countByStatus(rows as { status: string }[])
    : null;

  const filteredRows = section === 'prompts' && searchQuery.trim()
    ? (rows as AdminAiPromptTemplateItem[]).filter((row) =>
        row.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : rows;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <div className="ait-uh">
        <div className="ait-uh-left">
          <p className="ait-uh-eyebrow">Admin — AI Management</p>
          <h1 className="ait-uh-title">AI Teacher</h1>
          <p className="ait-uh-sub">{rows.length} {currentTab?.label.toLowerCase()} entr{rows.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        {section === 'prompts' && !showCreate && (
          <button type="button" className="ait-add-btn" onClick={() => setShowCreate(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
            New Prompt Draft
          </button>
        )}
      </div>

      <nav className="ait-nav" aria-label="AI Teacher navigation">
        <ul className="ait-nav-list" role="list">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <button
                type="button"
                onClick={() => goToSection(tab.key)}
                className={`ait-nav-link${tab.key === section ? ' ait-nav-link--active' : ''}`}
                aria-current={tab.key === section ? 'page' : undefined}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {statusCounts && (
        <div className="ait-stats">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className={`ait-sp ait-sp--${status === 'active' ? 'active' : status === 'draft' ? 'pending' : 'disabled'}`}>
              <span className="ait-sp-dot" />
              {count} {status}
            </div>
          ))}
        </div>
      )}

      {section === 'prompts' && !showCreate && (
        <div className="ait-search">
          <svg className="ait-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name…"
            className="ait-search-input"
          />
        </div>
      )}

      {section === 'prompts' && showCreate && (
        <PromptDraftForm onSubmit={handleCreateDraft} onDone={() => setShowCreate(false)} />
      )}

      {actionError && (
        <p className="admin-error-banner" role="alert">{actionError}</p>
      )}

      {filteredRows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No entries to display for this section.</p>
      ) : (
        <>
          {section === 'prompts' && (
            <AdminTable
              columns={promptColumns}
              rows={filteredRows as AdminAiPromptTemplateItem[]}
              getRowKey={(row) => row.id}
              caption={`${filteredRows.length} prompt template versions`}
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

      <style>{`
        .ait-uh { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-12); }
        .ait-uh-left { display: flex; flex-direction: column; gap: 2px; }
        .ait-uh-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ait-uh-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ait-uh-sub { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .ait-add-btn {
          display: inline-flex; align-items: center; gap: 8px; height: 40px;
          padding: 0 20px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .ait-add-btn:hover { background: var(--color-primary-600); }

        .ait-nav {
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-8);
          overflow-x: auto;
        }
        .ait-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: var(--space-4);
          flex-wrap: nowrap;
        }
        .ait-nav-link {
          display: inline-flex;
          align-items: center;
          min-height: var(--touch-target);
          padding: var(--space-8) var(--space-12);
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          font-size: 13px;
          font-family: inherit;
          font-weight: var(--weight-medium);
          color: var(--text-secondary);
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard),
                      color var(--duration-fast) var(--ease-standard);
        }
        .ait-nav-link:hover {
          background: var(--state-hover);
          color: var(--text-primary);
        }
        .ait-nav-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
        .ait-nav-link--active {
          color: var(--text-primary);
          font-weight: var(--weight-semibold);
          background: var(--state-hover);
        }

        .ait-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .ait-sp {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
          text-transform: capitalize;
        }
        .ait-sp--active { background: color-mix(in srgb, var(--color-success-500) 12%, transparent); color: var(--color-success-600); }
        .ait-sp--active .ait-sp-dot { background: var(--color-success-500); }
        .ait-sp--pending { background: color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent); color: var(--color-warning-600, #d97706); }
        .ait-sp--pending .ait-sp-dot { background: var(--color-warning-500, #f59e0b); }
        .ait-sp--disabled { background: var(--surface-sunken); color: var(--text-secondary); }
        .ait-sp--disabled .ait-sp-dot { background: var(--text-muted); }
        .ait-sp-dot { width: 8px; height: 8px; border-radius: 50%; }

        .ait-search { position: relative; max-width: 340px; }
        .ait-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
        }
        .ait-search-input {
          width: 100%; height: 40px; padding: 0 12px 0 36px;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary);
          font-size: 14px; font-family: inherit;
        }
        .ait-search-input:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .ait-search-input::placeholder { color: var(--text-muted); }

        @media (max-width: 640px) {
          .ait-nav { padding-inline-start: var(--space-4); }
          .ait-search { max-width: none; }
        }
      `}</style>
    </div>
  );
}

function countByStatus(rows: readonly { status: string }[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
}
