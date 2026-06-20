'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  AdminAssessmentDetail,
  AdminAssessmentType,
  AdminAssessmentSettings,
} from '../../../../lib/api/admin-assessments-api';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminSelect,
  AdminStatusBadge,
  AdminBadge,
} from '../../../../components/common';

const TYPE_LABELS: Record<AdminAssessmentType, string> = {
  quiz: 'Quiz',
  exam: 'Exam',
};

type Props = {
  readonly assessment: AdminAssessmentDetail;
  readonly onUpdate: (data: {
    title: string;
    settings: Partial<AdminAssessmentSettings>;
  }) => Promise<{ error?: string }>;
};

export function AssessmentEditorClient({ assessment, onUpdate }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(assessment.title);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    assessment.settings.timeLimitMinutes != null ? String(assessment.settings.timeLimitMinutes) : '',
  );
  const [passMark, setPassMark] = useState(
    assessment.settings.passMark != null ? String(assessment.settings.passMark) : '',
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(assessment.settings.shuffleQuestions);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (timeLimitMinutes && (isNaN(Number(timeLimitMinutes)) || Number(timeLimitMinutes) < 1)) {
      errors.timeLimit = 'Time limit must be a positive number.';
    }
    if (passMark && (isNaN(Number(passMark)) || Number(passMark) < 0 || Number(passMark) > 100)) {
      errors.passMark = 'Pass mark must be between 0 and 100.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    startTransition(async () => {
      const result = await onUpdate({
        title: title.trim(),
        settings: {
          timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
          passMark: passMark ? Number(passMark) : null,
          shuffleQuestions,
        },
      });
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleCancel() {
    setTitle(assessment.title);
    setTimeLimitMinutes(assessment.settings.timeLimitMinutes != null ? String(assessment.settings.timeLimitMinutes) : '');
    setPassMark(assessment.settings.passMark != null ? String(assessment.settings.passMark) : '');
    setShuffleQuestions(assessment.settings.shuffleQuestions);
    setFieldErrors({});
    setError(null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminCard title="Assessment Details">
          <dl className="aim-detail-grid">
            <div className="aim-detail-row">
              <dt>Title</dt>
              <dd>{assessment.title}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Type</dt>
              <dd><AdminBadge variant={assessment.type === 'exam' ? 'primary' : 'info'}>{TYPE_LABELS[assessment.type]}</AdminBadge></dd>
            </div>
            <div className="aim-detail-row">
              <dt>Status</dt>
              <dd><AdminStatusBadge status={assessment.status} /></dd>
            </div>
            <div className="aim-detail-row">
              <dt>Questions</dt>
              <dd>{assessment.questionIds.length}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Created</dt>
              <dd>{new Date(assessment.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Updated</dt>
              <dd>{new Date(assessment.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard title="Settings">
          <dl className="aim-detail-grid">
            <div className="aim-detail-row">
              <dt>Time Limit</dt>
              <dd>{assessment.settings.timeLimitMinutes != null ? `${assessment.settings.timeLimitMinutes} minutes` : 'No limit'}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Pass Mark</dt>
              <dd>{assessment.settings.passMark != null ? `${assessment.settings.passMark}%` : 'Not set'}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Shuffle Questions</dt>
              <dd>{assessment.settings.shuffleQuestions ? 'Yes' : 'No'}</dd>
            </div>
          </dl>

          {assessment.status !== 'archived' && (
            <div style={{ marginBlockStart: 'var(--space-16)' }}>
              <AdminButton variant="primary" onClick={() => setEditing(true)}>
                Edit Assessment
              </AdminButton>
            </div>
          )}
        </AdminCard>

        <div className="admin-boundary-note">
          <strong>Backend authority:</strong> Assessment grading, scoring, deadlines,
          and pass/fail determination are computed by the backend only.
        </div>

        <style>{`
          .aim-detail-grid {
            display: grid;
            gap: var(--space-12);
            margin: 0;
          }
          .aim-detail-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: var(--space-8);
            align-items: start;
          }
          .aim-detail-row dt {
            font-weight: var(--weight-semibold);
            font-size: 13px;
            color: var(--text-secondary);
          }
          .aim-detail-row dd {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <AdminCard title="Edit Assessment">
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField id="a-title" label="Title" required error={fieldErrors.title}>
          <AdminInput
            id="a-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 1 Quiz"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.title}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField id="a-type" label="Type" hint="Type cannot be changed after creation.">
          <AdminInput id="a-type" type="text" value={TYPE_LABELS[assessment.type]} disabled />
        </AdminFormField>

        <AdminFormField id="a-time-limit" label="Time Limit (minutes)" error={fieldErrors.timeLimit}>
          <AdminInput
            id="a-time-limit"
            type="number"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(e.target.value)}
            placeholder="Leave empty for no limit"
            disabled={isPending}
            min={1}
            hasError={!!fieldErrors.timeLimit}
          />
        </AdminFormField>

        <AdminFormField id="a-pass-mark" label="Pass Mark (%)" error={fieldErrors.passMark}>
          <AdminInput
            id="a-pass-mark"
            type="number"
            value={passMark}
            onChange={(e) => setPassMark(e.target.value)}
            placeholder="e.g. 70"
            disabled={isPending}
            min={0}
            max={100}
            hasError={!!fieldErrors.passMark}
          />
        </AdminFormField>

        <AdminFormField id="a-shuffle" label="Shuffle Questions">
          <AdminSelect
            id="a-shuffle"
            value={shuffleQuestions ? 'yes' : 'no'}
            onChange={(e) => setShuffleQuestions(e.target.value === 'yes')}
            disabled={isPending}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </AdminSelect>
        </AdminFormField>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-12)', marginBlockStart: 'var(--space-16)' }}>
        <AdminButton variant="primary" onClick={handleSubmit} disabled={isPending} loading={isPending}>
          Save Changes
        </AdminButton>
        <AdminButton variant="secondary" onClick={handleCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>
    </AdminCard>
  );
}
