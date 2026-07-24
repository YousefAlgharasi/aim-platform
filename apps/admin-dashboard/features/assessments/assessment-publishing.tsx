'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminAssessmentStatus } from './admin-assessments-api';
import { usePublishAssessmentMutation } from './hooks/use-assessments-query';
import {
  AdminButton,
  AdminCard,
  AdminStatusBadge,
  AdminConfirmDialog,
} from '../../components/common';

type Props = {
  readonly assessmentId: string;
  readonly status: AdminAssessmentStatus;
  readonly questionCount: number;
  readonly onPublish?: () => Promise<{ error?: string }>;
  readonly onUnpublish?: () => Promise<{ error?: string }>;
  readonly onArchive?: () => Promise<{ error?: string }>;
};

export function AssessmentPublishing({
  assessmentId,
  status,
  questionCount,
  onPublish,
  onUnpublish,
  onArchive,
}: Props) {
  const router = useRouter();
  const publishMutation = usePublishAssessmentMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'publish' | 'unpublish' | 'archive' | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmConfig = {
    publish: {
      title: 'Publish Assessment',
      description: questionCount === 0
        ? 'This assessment has no questions. Are you sure you want to publish it?'
        : `Publish this assessment with ${questionCount} question${questionCount !== 1 ? 's' : ''}? Students will be able to access it.`,
      confirmLabel: 'Publish',
      variant: 'default' as const,
      action: async () => {
        if (onPublish) {
          const res = await onPublish();
          if (res?.error) return res;
        }
        await publishMutation.mutateAsync(assessmentId);
        return {};
      },
    },
    unpublish: {
      title: 'Unpublish Assessment',
      description: 'This will make the assessment unavailable to students. In-progress attempts may be affected.',
      confirmLabel: 'Unpublish',
      variant: 'destructive' as const,
      action: onUnpublish,
    },
    archive: {
      title: 'Archive Assessment',
      description: 'Archived assessments cannot be edited or taken by students. This action can be reversed by an admin.',
      confirmLabel: 'Archive',
      variant: 'destructive' as const,
      action: onArchive,
    },
  };

  function handleConfirm() {
    if (!confirmAction) return;
    const config = confirmConfig[confirmAction];
    setError(null);
    startTransition(async () => {
      try {
        const result = await config.action?.();
        if (result?.error) {
          setError(result.error);
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to perform action.');
      } finally {
        setConfirmAction(null);
      }
    });
  }

  const isBusy = isPending || publishMutation.isPending;

  return (
    <AdminCard title="Publishing">
      {error && (
        <div className="admin-error-banner mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          Current Status:
        </span>
        <AdminStatusBadge status={status} />
      </div>

      <div className="flex gap-3 flex-wrap">
        {status === 'draft' && (
          <AdminButton
            variant="primary"
            onClick={() => setConfirmAction('publish')}
            disabled={isBusy}
            loading={isBusy && confirmAction === 'publish'}
          >
            Publish
          </AdminButton>
        )}

        {status === 'published' && (
          <AdminButton
            variant="secondary"
            onClick={() => setConfirmAction('unpublish')}
            disabled={isBusy}
            loading={isBusy && confirmAction === 'unpublish'}
          >
            Unpublish
          </AdminButton>
        )}

        {status !== 'archived' && (
          <AdminButton
            variant="destructive"
            onClick={() => setConfirmAction('archive')}
            disabled={isBusy}
            loading={isBusy && confirmAction === 'archive'}
          >
            Archive
          </AdminButton>
        )}

        {status === 'archived' && (
          <p className="text-sm text-[var(--text-secondary)]">
            This assessment is archived. Contact an administrator to restore it.
          </p>
        )}
      </div>

      <div className="admin-boundary-note mt-4">
        <strong>Backend authority:</strong> Publishing state transitions are enforced
        by the backend. The UI sends requests only.
      </div>

      {confirmAction && (
        <AdminConfirmDialog
          open
          title={confirmConfig[confirmAction].title}
          description={confirmConfig[confirmAction].description}
          confirmLabel={confirmConfig[confirmAction].confirmLabel}
          variant={confirmConfig[confirmAction].variant}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </AdminCard>
  );
}
