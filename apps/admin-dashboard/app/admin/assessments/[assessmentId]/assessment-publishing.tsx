'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminAssessmentStatus } from '../../../../lib/api/admin-assessments-api';
import {
  AdminButton,
  AdminCard,
  AdminStatusBadge,
  AdminConfirmDialog,
} from '../../../../components/common';

type Props = {
  readonly assessmentId: string;
  readonly status: AdminAssessmentStatus;
  readonly questionCount: number;
  readonly onPublish: () => Promise<{ error?: string }>;
  readonly onUnpublish: () => Promise<{ error?: string }>;
  readonly onArchive: () => Promise<{ error?: string }>;
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
      action: onPublish,
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
      const result = await config.action();
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
      setConfirmAction(null);
    });
  }

  return (
    <AdminCard title="Publishing">
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBlockEnd: 'var(--space-16)' }}>
        <span style={{ fontSize: '14px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
          Current Status:
        </span>
        <AdminStatusBadge status={status} />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
        {status === 'draft' && (
          <AdminButton
            variant="primary"
            onClick={() => setConfirmAction('publish')}
            disabled={isPending}
            loading={isPending && confirmAction === 'publish'}
          >
            Publish
          </AdminButton>
        )}

        {status === 'published' && (
          <AdminButton
            variant="secondary"
            onClick={() => setConfirmAction('unpublish')}
            disabled={isPending}
            loading={isPending && confirmAction === 'unpublish'}
          >
            Unpublish
          </AdminButton>
        )}

        {status !== 'archived' && (
          <AdminButton
            variant="destructive"
            onClick={() => setConfirmAction('archive')}
            disabled={isPending}
            loading={isPending && confirmAction === 'archive'}
          >
            Archive
          </AdminButton>
        )}

        {status === 'archived' && (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            This assessment is archived. Contact an administrator to restore it.
          </p>
        )}
      </div>

      <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-16)' }}>
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
