'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminAssessmentSettings } from '../../../../lib/api/admin-assessments-api';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminSelect,
} from '../../../../components/common';

type ExtendedSettings = AdminAssessmentSettings & {
  readonly maxAttempts: number | null;
  readonly showResultsToStudent: boolean;
  readonly gradingPolicy: 'highest' | 'latest' | 'average';
  readonly visibleToStudents: boolean;
};

type Props = {
  readonly assessmentId: string;
  readonly settings: AdminAssessmentSettings;
  readonly disabled?: boolean;
  readonly onUpdateSettings: (settings: Partial<ExtendedSettings>) => Promise<{ error?: string }>;
};

export function AssessmentSettings({
  assessmentId,
  settings,
  disabled,
  onUpdateSettings,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const extSettings = settings as Partial<ExtendedSettings> & AdminAssessmentSettings;

  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    settings.timeLimitMinutes != null ? String(settings.timeLimitMinutes) : '',
  );
  const [passMark, setPassMark] = useState(
    settings.passMark != null ? String(settings.passMark) : '',
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(settings.shuffleQuestions);
  const [maxAttempts, setMaxAttempts] = useState(
    extSettings.maxAttempts != null ? String(extSettings.maxAttempts) : '',
  );
  const [showResultsToStudent, setShowResultsToStudent] = useState(
    extSettings.showResultsToStudent ?? true,
  );
  const [gradingPolicy, setGradingPolicy] = useState<'highest' | 'latest' | 'average'>(
    extSettings.gradingPolicy ?? 'highest',
  );
  const [visibleToStudents, setVisibleToStudents] = useState(
    extSettings.visibleToStudents ?? true,
  );

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (timeLimitMinutes && (isNaN(Number(timeLimitMinutes)) || Number(timeLimitMinutes) < 1)) {
      errors.timeLimit = 'Time limit must be a positive number.';
    }
    if (passMark && (isNaN(Number(passMark)) || Number(passMark) < 0 || Number(passMark) > 100)) {
      errors.passMark = 'Pass mark must be between 0 and 100.';
    }
    if (maxAttempts && (isNaN(Number(maxAttempts)) || Number(maxAttempts) < 1)) {
      errors.maxAttempts = 'Max attempts must be a positive number.';
    }
    return errors;
  }

  function handleSave() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    startTransition(async () => {
      const result = await onUpdateSettings({
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
        passMark: passMark ? Number(passMark) : null,
        shuffleQuestions,
        maxAttempts: maxAttempts ? Number(maxAttempts) : null,
        showResultsToStudent,
        gradingPolicy,
        visibleToStudents,
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
    setTimeLimitMinutes(settings.timeLimitMinutes != null ? String(settings.timeLimitMinutes) : '');
    setPassMark(settings.passMark != null ? String(settings.passMark) : '');
    setShuffleQuestions(settings.shuffleQuestions);
    setMaxAttempts(extSettings.maxAttempts != null ? String(extSettings.maxAttempts) : '');
    setShowResultsToStudent(extSettings.showResultsToStudent ?? true);
    setGradingPolicy(extSettings.gradingPolicy ?? 'highest');
    setVisibleToStudents(extSettings.visibleToStudents ?? true);
    setFieldErrors({});
    setError(null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <AdminCard title="Assessment Settings">
        <dl className="aim-settings-grid">
          <div className="aim-settings-row">
            <dt>Time Limit</dt>
            <dd>{settings.timeLimitMinutes != null ? `${settings.timeLimitMinutes} minutes` : 'No limit'}</dd>
          </div>
          <div className="aim-settings-row">
            <dt>Pass Mark</dt>
            <dd>{settings.passMark != null ? `${settings.passMark}%` : 'Not set'}</dd>
          </div>
          <div className="aim-settings-row">
            <dt>Shuffle Questions</dt>
            <dd>{settings.shuffleQuestions ? 'Yes' : 'No'}</dd>
          </div>
          <div className="aim-settings-row">
            <dt>Max Attempts</dt>
            <dd>{extSettings.maxAttempts != null ? String(extSettings.maxAttempts) : 'Unlimited'}</dd>
          </div>
          <div className="aim-settings-row">
            <dt>Show Results to Student</dt>
            <dd>{(extSettings.showResultsToStudent ?? true) ? 'Yes' : 'No'}</dd>
          </div>
          <div className="aim-settings-row">
            <dt>Grading Policy</dt>
            <dd style={{ textTransform: 'capitalize' }}>{extSettings.gradingPolicy ?? 'highest'}</dd>
          </div>
          <div className="aim-settings-row">
            <dt>Visible to Students</dt>
            <dd>{(extSettings.visibleToStudents ?? true) ? 'Yes' : 'No'}</dd>
          </div>
        </dl>

        {!disabled && (
          <div style={{ marginBlockStart: 'var(--space-16)' }}>
            <AdminButton variant="primary" onClick={() => setEditing(true)}>
              Edit Settings
            </AdminButton>
          </div>
        )}

        <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-16)' }}>
          <strong>Backend authority:</strong> Grading, scoring, pass/fail determination,
          and attempt limits are enforced by the backend only.
        </div>

        <style>{`
          .aim-settings-grid {
            display: grid;
            gap: var(--space-12);
            margin: 0;
          }
          .aim-settings-row {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: var(--space-8);
            align-items: start;
          }
          .aim-settings-row dt {
            font-weight: var(--weight-semibold);
            font-size: 13px;
            color: var(--text-secondary);
          }
          .aim-settings-row dd {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Edit Assessment Settings">
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField id="s-time-limit" label="Time Limit (minutes)" error={fieldErrors.timeLimit}>
          <AdminInput
            id="s-time-limit"
            type="number"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(e.target.value)}
            placeholder="Leave empty for no limit"
            disabled={isPending}
            min={1}
            hasError={!!fieldErrors.timeLimit}
          />
        </AdminFormField>

        <AdminFormField id="s-pass-mark" label="Pass Mark (%)" error={fieldErrors.passMark}>
          <AdminInput
            id="s-pass-mark"
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

        <AdminFormField id="s-shuffle" label="Shuffle Questions">
          <AdminSelect
            id="s-shuffle"
            value={shuffleQuestions ? 'yes' : 'no'}
            onChange={(e) => setShuffleQuestions(e.target.value === 'yes')}
            disabled={isPending}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </AdminSelect>
        </AdminFormField>

        <AdminFormField id="s-max-attempts" label="Max Attempts" error={fieldErrors.maxAttempts}>
          <AdminInput
            id="s-max-attempts"
            type="number"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            placeholder="Leave empty for unlimited"
            disabled={isPending}
            min={1}
            hasError={!!fieldErrors.maxAttempts}
          />
        </AdminFormField>

        <AdminFormField id="s-show-results" label="Show Results to Student">
          <AdminSelect
            id="s-show-results"
            value={showResultsToStudent ? 'yes' : 'no'}
            onChange={(e) => setShowResultsToStudent(e.target.value === 'yes')}
            disabled={isPending}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </AdminSelect>
        </AdminFormField>

        <AdminFormField
          id="s-grading-policy"
          label="Grading Policy"
          hint="How the final grade is determined when multiple attempts are allowed."
        >
          <AdminSelect
            id="s-grading-policy"
            value={gradingPolicy}
            onChange={(e) => setGradingPolicy(e.target.value as 'highest' | 'latest' | 'average')}
            disabled={isPending}
          >
            <option value="highest">Highest Score</option>
            <option value="latest">Latest Attempt</option>
            <option value="average">Average of All Attempts</option>
          </AdminSelect>
        </AdminFormField>

        <AdminFormField id="s-visible" label="Visible to Students">
          <AdminSelect
            id="s-visible"
            value={visibleToStudents ? 'yes' : 'no'}
            onChange={(e) => setVisibleToStudents(e.target.value === 'yes')}
            disabled={isPending}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </AdminSelect>
        </AdminFormField>
      </div>

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Grading, scoring, pass/fail determination,
        and attempt limits are enforced by the backend only. These settings are sent
        to the backend for enforcement.
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
        <AdminButton variant="primary" onClick={handleSave} disabled={isPending} loading={isPending}>
          Save Settings
        </AdminButton>
        <AdminButton variant="secondary" onClick={handleCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>
    </AdminCard>
  );
}
