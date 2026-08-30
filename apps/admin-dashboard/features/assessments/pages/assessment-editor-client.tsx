'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  AdminAssessmentDetail,
  AdminAssessmentType,
  AdminAssessmentSettings,
} from '../api/admin-assessments-api';
import Link from 'next/link';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminSelect,
  AdminStatusBadge,
  AdminBadge,
} from '../../../shared/components/Misc';

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
      <div className="flex flex-col gap-4">
        <AdminCard title="Assessment Details">
          <dl className="grid gap-3 m-0">
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Title</dt>
              <dd className="m-0 text-sm">{assessment.title}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Type</dt>
              <dd className="m-0 text-sm"><AdminBadge variant={assessment.type === 'exam' ? 'primary' : 'info'}>{TYPE_LABELS[assessment.type]}</AdminBadge></dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Status</dt>
              <dd className="m-0 text-sm"><AdminStatusBadge status={assessment.status} /></dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Questions</dt>
              <dd className="m-0 text-sm">{assessment.questionIds.length}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Created</dt>
              <dd className="m-0 text-sm">{new Date(assessment.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Updated</dt>
              <dd className="m-0 text-sm">{new Date(assessment.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-4">
            <Link href={`/admin/assessments/${assessment.id}/preview`} className="text-sm text-[var(--color-primary-600)] hover:underline">
              Preview as Student →
            </Link>
            <Link href={`/admin/assessments/${assessment.id}/results`} className="text-sm text-[var(--color-primary-600)] hover:underline">
              View Results →
            </Link>
          </div>
        </AdminCard>

        <AdminCard title="Settings">
          <dl className="grid gap-3 m-0">
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Time Limit</dt>
              <dd className="m-0 text-sm">{assessment.settings.timeLimitMinutes != null ? `${assessment.settings.timeLimitMinutes} minutes` : 'No limit'}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Pass Mark</dt>
              <dd className="m-0 text-sm">{assessment.settings.passMark != null ? `${assessment.settings.passMark}%` : 'Not set'}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
              <dt className="font-semibold text-xs text-[var(--text-secondary)]">Shuffle Questions</dt>
              <dd className="m-0 text-sm">{assessment.settings.shuffleQuestions ? 'Yes' : 'No'}</dd>
            </div>
          </dl>

          {assessment.status !== 'archived' && (
            <div className="mt-4">
              <AdminButton variant="primary" onClick={() => setEditing(true)}>
                Edit Assessment
              </AdminButton>
            </div>
          )}
        </AdminCard>
      </div>
    );
  }

  return (
    <AdminCard title="Edit Assessment">
      {error && (
        <div className="admin-error-banner role-alert mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
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

      <div className="flex gap-3 mt-4">
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
