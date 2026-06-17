'use client';

// Phase 4 — P4-058
// PlacementTestStatusControl — client component.
//
// Scope: Placement Test phase only — admin UI to toggle placement test draft/published status.
//
// Security rules:
// - All initial data is fetched server-side (page.tsx) and passed as props.
// - This component calls server actions (passed as props) — never calls the backend directly.
// - Backend is the sole authority for status transitions and the active-test constraint.
// - Only 'draft' and 'published' transitions are exposed; 'archived' is not offered here.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PlacementTestStatus } from '../../../../../../../../../lib/api/admin-placement-tests-api';

type PlacementTestStatusControlProps = {
  readonly testId: string;
  readonly testTitle: string;
  readonly currentStatus: PlacementTestStatus;
  readonly onSetDraft: () => Promise<{ error?: string }>;
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
  onSetDraft,
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

  async function handleUnpublish() {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const result = await onSetDraft();
      if (result.error) {
        setActionError(result.error);
      } else {
        setActionSuccess('Test moved to draft. No active placement test until another is published.');
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
            may be published at a time — the backend enforces this.
          </p>
        )}
        {isArchived && (
          <p className="skill-linker-empty">
            This test is <strong>archived</strong>. Archived tests cannot be published
            through this UI. Contact your system administrator if you need to restore it.
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
                onClick={handleUnpublish}
                disabled={isPending}
              >
                {isPending ? 'Unpublishing…' : '↩ Move to Draft'}
              </button>
            )}
          </div>

          {currentStatus === 'draft' && (
            <p className="admin-boundary-note" style={{ marginTop: '0.5rem' }}>
              Publishing will make this the active placement test. If another test is
              currently published, the backend will reject this action (409
              ACTIVE_TEST_EXISTS). Unpublish the active test first.
            </p>
          )}
          {currentStatus === 'published' && (
            <p className="admin-boundary-note" style={{ marginTop: '0.5rem' }}>
              Moving to draft will deactivate this test. Students will not be assigned
              placement until a test is published again.
            </p>
          )}

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

      {/* Backend authority note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Status transitions (draft ↔ published) are
        enforced by the backend. Only one placement test may be{' '}
        <strong>published</strong> at a time — the backend rejects a second publish with{' '}
        <code>409 ACTIVE_TEST_EXISTS</code>. Placement scoring, CEFR thresholds, skill
        maps, and weakness maps are always computed server-side — never by this UI.
      </div>
    </div>
  );
}
