'use client';
// P11-028: Content status workflow component using AIM design system.
// Backend is the sole authority for status transitions.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALLOWED_TRANSITIONS,
  type AllowedTransition,
  type ContentStatus,
} from '../api/admin-content-status-api';
import {
  AdminCard,
  AdminBadge,
  AdminButton,
} from '../../../shared/components/Misc';
import { AdminErrorBanner } from '../../../shared/layouts/DashboardLayout';

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
      <div className="flex items-center gap-3 mb-4">
        <span className="text-base font-semibold">{entityTitle}</span>
        <AdminBadge variant={STATUS_VARIANT[currentStatus]}>
          {STATUS_LABELS[currentStatus]}
        </AdminBadge>
      </div>

      {isLesson && typeof skillLinkCount === 'number' && (
        <div
          className={`p-3 px-4 mb-3 rounded-xl text-sm ${
            skillLinkCount === 0
              ? 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]'
              : 'bg-[var(--color-success-50)] text-[var(--color-success-700)]'
          }`}
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
        <div className="my-3">
          <AdminErrorBanner message={actionError} />
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 px-4 my-3 rounded-xl bg-[var(--color-success-50)] text-[var(--color-success-700)] text-sm font-medium" role="status">
          {actionSuccess}
        </div>
      )}

      {transitions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          No transitions available for current status.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
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
                <span className="inline-flex items-center justify-center ml-1 px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider">
                  SA
                </span>
              )}
            </AdminButton>
          ))}
        </div>
      )}
    </AdminCard>
  );
}
