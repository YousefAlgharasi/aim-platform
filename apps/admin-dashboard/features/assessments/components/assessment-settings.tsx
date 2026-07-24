'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AdminAssessmentSettings } from '../api/admin-assessments-api';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminSelect,
} from '../../../shared/components/Misc';

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

const assessmentSettingsSchema = z.object({
  timeLimitMinutes: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : (isNaN(Number(val)) ? -1 : Number(val))),
    z.number({ message: 'Time limit must be a positive number.' })
      .min(1, 'Time limit must be a positive number.')
      .nullable()
  ),
  passMark: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : (isNaN(Number(val)) ? -1 : Number(val))),
    z.number({ message: 'Pass mark must be between 0 and 100.' })
      .min(0, 'Pass mark must be between 0 and 100.')
      .max(100, 'Pass mark must be between 0 and 100.')
      .nullable()
  ),
  shuffleQuestions: z.preprocess(
    (val) => (typeof val === 'string' ? val === 'yes' : Boolean(val)),
    z.boolean()
  ),
  maxAttempts: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : (isNaN(Number(val)) ? -1 : Number(val))),
    z.number({ message: 'Max attempts must be a positive number.' })
      .min(1, 'Max attempts must be a positive number.')
      .nullable()
  ),
  showResultsToStudent: z.preprocess(
    (val) => (typeof val === 'string' ? val === 'yes' : Boolean(val)),
    z.boolean()
  ),
  gradingPolicy: z.enum(['highest', 'latest', 'average']),
  visibleToStudents: z.preprocess(
    (val) => (typeof val === 'string' ? val === 'yes' : Boolean(val)),
    z.boolean()
  ),
});

type AssessmentSettingsInput = z.input<typeof assessmentSettingsSchema>;
type AssessmentSettingsOutput = z.output<typeof assessmentSettingsSchema>;

export function AssessmentSettings({
  assessmentId,
  settings,
  disabled,
  onUpdateSettings,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const extSettings = settings as Partial<ExtendedSettings> & AdminAssessmentSettings;

  const getDefaultValues = (): AssessmentSettingsInput => ({
    timeLimitMinutes: settings.timeLimitMinutes != null ? settings.timeLimitMinutes : '',
    passMark: settings.passMark != null ? settings.passMark : '',
    shuffleQuestions: settings.shuffleQuestions ? 'yes' : 'no',
    maxAttempts: extSettings.maxAttempts != null ? extSettings.maxAttempts : '',
    showResultsToStudent: (extSettings.showResultsToStudent ?? true) ? 'yes' : 'no',
    gradingPolicy: extSettings.gradingPolicy ?? 'highest',
    visibleToStudents: (extSettings.visibleToStudents ?? true) ? 'yes' : 'no',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentSettingsInput, unknown, AssessmentSettingsOutput>({
    resolver: zodResolver(assessmentSettingsSchema),
    defaultValues: getDefaultValues(),
  });

  function handleStartEdit() {
    reset(getDefaultValues());
    setError(null);
    setEditing(true);
  }

  function handleCancel() {
    reset(getDefaultValues());
    setError(null);
    setEditing(false);
  }

  const onFormSubmit = (data: AssessmentSettingsOutput) => {
    setError(null);
    startTransition(async () => {
      const result = await onUpdateSettings(data);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  };

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
            <AdminButton variant="primary" onClick={handleStartEdit}>
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

      <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField label="Time Limit (minutes)" error={errors.timeLimitMinutes?.message}>
          {(fieldProps) => (
            <AdminInput
              type="number"
              {...fieldProps}
              {...register('timeLimitMinutes')}
              placeholder="Leave empty for no limit"
              disabled={isPending}
              min={1}
              hasError={!!errors.timeLimitMinutes}
            />
          )}
        </AdminFormField>

        <AdminFormField label="Pass Mark (%)" error={errors.passMark?.message}>
          {(fieldProps) => (
            <AdminInput
              type="number"
              {...fieldProps}
              {...register('passMark')}
              placeholder="e.g. 70"
              disabled={isPending}
              min={0}
              max={100}
              hasError={!!errors.passMark}
            />
          )}
        </AdminFormField>

        <AdminFormField label="Shuffle Questions">
          {(fieldProps) => (
            <AdminSelect
              {...fieldProps}
              {...register('shuffleQuestions')}
              disabled={isPending}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </AdminSelect>
          )}
        </AdminFormField>

        <AdminFormField label="Max Attempts" error={errors.maxAttempts?.message}>
          {(fieldProps) => (
            <AdminInput
              type="number"
              {...fieldProps}
              {...register('maxAttempts')}
              placeholder="Leave empty for unlimited"
              disabled={isPending}
              min={1}
              hasError={!!errors.maxAttempts}
            />
          )}
        </AdminFormField>

        <AdminFormField label="Show Results to Student">
          {(fieldProps) => (
            <AdminSelect
              {...fieldProps}
              {...register('showResultsToStudent')}
              disabled={isPending}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </AdminSelect>
          )}
        </AdminFormField>

        <AdminFormField
          label="Grading Policy"
          hint="How the final grade is determined when multiple attempts are allowed."
        >
          {(fieldProps) => (
            <AdminSelect
              {...fieldProps}
              {...register('gradingPolicy')}
              disabled={isPending}
            >
              <option value="highest">Highest Score</option>
              <option value="latest">Latest Attempt</option>
              <option value="average">Average of All Attempts</option>
            </AdminSelect>
          )}
        </AdminFormField>

        <AdminFormField label="Visible to Students">
          {(fieldProps) => (
            <AdminSelect
              {...fieldProps}
              {...register('visibleToStudents')}
              disabled={isPending}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </AdminSelect>
          )}
        </AdminFormField>

        <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
          <strong>Backend authority:</strong> Grading, scoring, pass/fail determination,
          and attempt limits are enforced by the backend only. These settings are sent
          to the backend for enforcement.
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
          <AdminButton type="submit" variant="primary" disabled={isPending} loading={isPending}>
            Save Settings
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={handleCancel} disabled={isPending}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}

