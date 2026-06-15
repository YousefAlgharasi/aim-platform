'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALLOWED_TRANSITIONS,
  type AllowedTransition,
  type ContentStatus,
} from '../lib/api/admin-content-status-api';

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

const STATUS_CLASSES: Record<ContentStatus, string> = {
  draft: 'status-draft',
  published: 'status-published',
  archived: 'status-archived',
};

const ACTION_CLASSES: Record<string, string> = {
  publish: 'btn-workflow-publish',
  archive: 'btn-workflow-archive',
  restore: 'btn-workflow-restore',
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
    <div className="status-workflow">
      <div className="status-workflow-header">
        <span className="status-workflow-entity-title">{entityTitle}</span>
        <span className={`status-badge ${STATUS_CLASSES[currentStatus]}`}>
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>

      {isLesson && typeof skillLinkCount === 'number' && (
        <div
          className={
            skillLinkCount === 0
              ? 'status-workflow-skill-warning'
              : 'status-workflow-skill-ok'
          }
        >
          {skillLinkCount === 0 ? (
            <>
              <strong>⚠ No skills linked.</strong> Publish is blocked until at least
              one skill is linked to this lesson.
            </>
          ) : (
            <>✓ {skillLinkCount} skill{skillLinkCount !== 1 ? 's' : ''} linked.</>
          )}
        </div>
      )}

      {actionError && (
        <p className="course-form-error" role="alert">{actionError}</p>
      )}

      {actionSuccess && (
        <p className="status-workflow-success" role="status">{actionSuccess}</p>
      )}

      {transitions.length === 0 ? (
        <p className="courses-empty">No transitions available for current status.</p>
      ) : (
        <div className="status-workflow-actions">
          {transitions.map((t) => (
            <button
              key={t.action}
              className={`btn-workflow ${ACTION_CLASSES[t.action] ?? ''}`}
              onClick={() => handleTransition(t)}
              disabled={isPending || (t.action === 'publish' && publishBlockedBySkills)}
              title={
                t.superAdminOnly
                  ? 'Super Admin only — backend enforces this restriction'
                  : `Requires ${t.permissionRequired}`
              }
            >
              {isPending ? 'Processing…' : t.label}
              {t.superAdminOnly && (
                <span className="status-workflow-super-badge">SA</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> All status transitions are validated and
        enforced by backend APIs. Permission checks, skill-link requirements, and
        audit logging are applied server-side. This UI calls backend workflow
        endpoints and cannot bypass backend content authority.
      </div>
    </div>
  );
}
