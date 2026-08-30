'use client';

// Phase 4 — P4-058
// PlacementTestStatusControl — client component.
//
// Scope: Placement Test phase only — admin UI to publish/archive a placement test.
//
// Security rules:
// - All initial data is fetched server-side (page.tsx) and passed as props.
// - This component calls server actions (passed as props) — never calls the backend directly.
// - Backend is the sole authority for status transitions and the active-test constraint.
// - Only 'published' and 'archived' transitions are exposed here; a draft can only be
//   published, and a published test can only be archived — there is no way back to draft.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PlacementTestStatus } from '../../../core/api/admin-placement-tests-api';

type PlacementTestStatusControlProps = {
  readonly testId: string;
  readonly testTitle: string;
  readonly currentStatus: PlacementTestStatus;
  readonly onArchive: () => Promise<{ error?: string }>;
  readonly onSetPublished: () => Promise<{ error?: string }>;
};

const STATUS_LABELS: Record<PlacementTestStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_BADGE_CLASSES: Record<PlacementTestStatus, string> = {
  draft: 'status-draft',
  published: 'status-published',
  archived: 'status-archived',
};

export function PlacementTestStatusControl({
  testId: _testId,
  testTitle,
  currentStatus,
  onArchive,
  onSetPublished,
}: PlacementTestStatusControlProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handlePublish() {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await onSetPublished();
      if (result.error) {
        setActionError(result.error);
      } else {
        setActionSuccess('Test published successfully. It is now the active placement test.');
        refresh();
      }
    });
  }

  async function handleArchive() {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await onArchive();
      if (result.error) {
        setActionError(result.error);
      } else {
        setActionSuccess('Test archived. No active placement test until another is published.');
        refresh();
      }
    });
  }

  const isArchived = currentStatus === 'archived';

  return (
    <div className="skill-linker">
      {/* Test context */}
      <div className="skill-linker-meta">
        <span className="skill-linker-lesson-title">{testTitle}</span>
        <span className={`status-badge ${STATUS_BADGE_CLASSES[currentStatus]}`}>
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>

      {/* Current status explanation */}
      <section className="skill-linker-section">
        <h2>Current Status</h2>
        {currentStatus === 'draft' && (
          <p className="skill-linker-empty">
            This test is in <strong>draft</strong>. It is not visible to students and will
            not be used for placement. Publish it to make it the active placement test.
          </p>
        )}
        {currentStatus === 'published' && (
          <p>
            This test is <strong>published</strong> and is the active placement test.
            Students will be assigned this test when they begin placement. Only one test
            can be published at a time.
          </p>
        )}
        {isArchived && (
          <p className="skill-linker-empty">
            This test is <strong>archived</strong>. Archived tests are no longer used for
            placement and cannot be republished through this page. Contact your system
            administrator if you need to restore it.
          </p>
        )}
      </section>

      {/* Status transition actions */}
      {!isArchived && (
        <section className="skill-linker-section">
          <h2>Change Status</h2>
          <div className="skill-add-row">
            {currentStatus === 'draft' && (
              <button
                className="btn-primary"
                onClick={handlePublish}
                disabled={isPending}
              >
                {isPending ? 'Publishing…' : '✓ Publish Test'}
              </button>
            )}
            {currentStatus === 'published' && (
              <button
                className="btn-danger"
                onClick={handleArchive}
                disabled={isPending}
              >
                {isPending ? 'Archiving…' : '↩ Archive Test'}
              </button>
            )}
          </div>

          {actionError && (
            <p className="course-form-error" role="alert">
              {actionError}
            </p>
          )}
          {actionSuccess && (
            <p className="admin-boundary-note" role="status">
              ✓ {actionSuccess}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
