'use client';
// P11-028: Content status workflow component using AIM design system.
// Backend is the sole authority for status transitions.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALLOWED_TRANSITIONS,
  type AllowedTransition,
  type ContentStatus,
} from '../lib/api/admin-content-status-api';
import {
  AdminCard,
  AdminBadge,
  AdminButton,
} from './common';

type StatusWorkflowProps = {
  readonly entityId: string;
  readonly entityType: string;
  readonly entityTitle: string;
  readonly currentStatus: ContentStatus;
  readonly skillLinkCount?: number;
  readonly onTransition: (
    action: 'publish' | 'archive' | 'restore',
  ) => Promise<{ error?: string }>;
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_VARIANT: Record<ContentStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  published: 'success',
  archived: 'error',
};

const ACTION_VARIANT: Record<string, 'primary' | 'secondary'> = {
  publish: 'primary',
  archive: 'secondary',
  restore: 'secondary',
};

export function ContentStatusWorkflow({
  entityId: _entityId,
  entityType,
  entityTitle,
  currentStatus,
  skillLinkCount,
  onTransition,
}: StatusWorkflowProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const transitions = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  const isLesson = entityType === 'lessons';
  const publishBlockedBySkills =
    isLesson && typeof skillLinkCount === 'number' && skillLinkCount === 0;

  async function handleTransition(t: AllowedTransition) {
    setActionError(null);
    setActionSuccess(null);

    if (t.action === 'publish' && publishBlockedBySkills) {
      setActionError(
        'This lesson cannot be published until at least one skill is linked. ' +
          'Add skill links before publishing.',
      );
      return;
    }

    startTransition(async () => {
      const result = await onTransition(t.action);
      if (result.error) {
        setActionError(result.error);
      } else {
        setActionSuccess(
          `${entityTitle} successfully transitioned to ${STATUS_LABELS[t.targetStatus]}.`,
        );
        router.refresh();
      }
    });
  }

  return (
    <AdminCard title="Status Workflow">
      <div className="aim-status-workflow-header">
        <span className="aim-status-workflow-title">{entityTitle}</span>
        <AdminBadge variant={STATUS_VARIANT[currentStatus]}>
          {STATUS_LABELS[currentStatus]}
        </AdminBadge>
      </div>

      {isLesson && typeof skillLinkCount === 'number' && (
        <div
          className={
            skillLinkCount === 0
              ? 'aim-status-workflow-skill-warning'
              : 'aim-status-workflow-skill-ok'
          }
        >
          {skillLinkCount === 0 ? (
            <>
              <strong>No skills linked.</strong> Publish is blocked until at least
              one skill is linked to this lesson.
            </>
          ) : (
            <>{skillLinkCount} skill{skillLinkCount !== 1 ? 's' : ''} linked.</>
          )}
        </div>
      )}

      {actionError && (
        <div className="admin-error-banner" role="alert" style={{ marginBlock: 'var(--space-12)' }}>
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="aim-status-workflow-success" role="status">
          {actionSuccess}
        </div>
      )}

      {transitions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No transitions available for current status.
        </p>
      ) : (
        <div className="aim-status-workflow-actions">
          {transitions.map((t) => (
            <AdminButton
              key={t.action}
              variant={ACTION_VARIANT[t.action] ?? 'secondary'}
              onClick={() => handleTransition(t)}
              disabled={isPending || (t.action === 'publish' && publishBlockedBySkills)}
              loading={isPending}
            >
              {t.label}
              {t.superAdminOnly && (
                <span className="aim-status-workflow-sa-badge">SA</span>
              )}
            </AdminButton>
          ))}
        </div>
      )}

      <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> All status transitions are validated and
        enforced by backend APIs. Permission checks, skill-link requirements, and
        audit logging are applied server-side.
      </div>

      <style>{`
        .aim-status-workflow-header {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          margin-block-end: var(--space-16);
        }
        .aim-status-workflow-title {
          font-size: 16px;
          font-weight: var(--weight-semibold);
        }
        .aim-status-workflow-skill-warning {
          padding: var(--space-12) var(--space-16);
          margin-block-end: var(--space-12);
          border-radius: var(--radius-md);
          background: var(--color-warning-50);
          color: var(--color-warning-700);
          font-size: 14px;
        }
        .aim-status-workflow-skill-ok {
          padding: var(--space-12) var(--space-16);
          margin-block-end: var(--space-12);
          border-radius: var(--radius-md);
          background: var(--color-success-50);
          color: var(--color-success-700);
          font-size: 14px;
        }
        .aim-status-workflow-success {
          padding: var(--space-12) var(--space-16);
          margin-block: var(--space-12);
          border-radius: var(--radius-md);
          background: var(--color-success-50);
          color: var(--color-success-700);
          font-size: 14px;
          font-weight: var(--weight-medium);
        }
        .aim-status-workflow-actions {
          display: flex;
          gap: var(--space-12);
          flex-wrap: wrap;
        }
        .aim-status-workflow-sa-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-inline-start: var(--space-4);
          padding: 1px 6px;
          border-radius: var(--radius-sm);
          background: var(--color-warning-100);
          color: var(--color-warning-800);
          font-size: 10px;
          font-weight: var(--weight-bold);
          letter-spacing: 0.5px;
        }
      `}</style>
    </AdminCard>
  );
}
