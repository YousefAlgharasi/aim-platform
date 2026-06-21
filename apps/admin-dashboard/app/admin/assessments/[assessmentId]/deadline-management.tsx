'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminSelect,
  AdminBadge,
} from '../../../../components/common';

type DeadlineConfig = {
  readonly opensAt: string | null;
  readonly closesAt: string | null;
  readonly lateSubmissionPolicy: 'none' | 'penalty' | 'allow';
  readonly latePenaltyPercent: number | null;
  readonly lateWindowMinutes: number | null;
};

type Props = {
  readonly assessmentId: string;
  readonly deadline: DeadlineConfig;
  readonly disabled?: boolean;
  readonly onUpdateDeadline: (deadline: DeadlineConfig) => Promise<{ error?: string }>;
};

function formatDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function formatDisplay(iso: string | null): string {
  if (!iso) return 'Not set';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function deriveWindowStatus(opensAt: string | null, closesAt: string | null): { label: string; variant: 'success' | 'warning' | 'error' | 'default' } {
  const now = Date.now();
  if (!opensAt && !closesAt) return { label: 'Always Open', variant: 'default' };
  if (opensAt && new Date(opensAt).getTime() > now) return { label: 'Scheduled', variant: 'warning' };
  if (closesAt && new Date(closesAt).getTime() < now) return { label: 'Closed', variant: 'error' };
  return { label: 'Open', variant: 'success' };
}

export function DeadlineManagement({
  assessmentId,
  deadline,
  disabled,
  onUpdateDeadline,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const [opensAt, setOpensAt] = useState(formatDateTimeLocal(deadline.opensAt));
  const [closesAt, setClosesAt] = useState(formatDateTimeLocal(deadline.closesAt));
  const [latePolicy, setLatePolicy] = useState(deadline.lateSubmissionPolicy);
  const [latePenalty, setLatePenalty] = useState(
    deadline.latePenaltyPercent != null ? String(deadline.latePenaltyPercent) : '',
  );
  const [lateWindow, setLateWindow] = useState(
    deadline.lateWindowMinutes != null ? String(deadline.lateWindowMinutes) : '',
  );

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (opensAt && closesAt && new Date(opensAt) >= new Date(closesAt)) {
      errors.closesAt = 'Close date must be after open date.';
    }
    if (latePolicy === 'penalty') {
      if (!latePenalty || isNaN(Number(latePenalty)) || Number(latePenalty) < 0 || Number(latePenalty) > 100) {
        errors.latePenalty = 'Penalty must be between 0 and 100.';
      }
      if (!lateWindow || isNaN(Number(lateWindow)) || Number(lateWindow) < 1) {
        errors.lateWindow = 'Late window must be a positive number.';
      }
    }
    return errors;
  }

  function handleSave() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    startTransition(async () => {
      const result = await onUpdateDeadline({
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        lateSubmissionPolicy: latePolicy,
        latePenaltyPercent: latePolicy === 'penalty' && latePenalty ? Number(latePenalty) : null,
        lateWindowMinutes: latePolicy !== 'none' && lateWindow ? Number(lateWindow) : null,
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
    setOpensAt(formatDateTimeLocal(deadline.opensAt));
    setClosesAt(formatDateTimeLocal(deadline.closesAt));
    setLatePolicy(deadline.lateSubmissionPolicy);
    setLatePenalty(deadline.latePenaltyPercent != null ? String(deadline.latePenaltyPercent) : '');
    setLateWindow(deadline.lateWindowMinutes != null ? String(deadline.lateWindowMinutes) : '');
    setFieldErrors({});
    setError(null);
    setEditing(false);
  }

  const windowStatus = deriveWindowStatus(deadline.opensAt, deadline.closesAt);

  if (!editing) {
    return (
      <AdminCard title="Deadline & Availability">
        <dl className="aim-deadline-grid">
          <div className="aim-deadline-row">
            <dt>Window Status</dt>
            <dd><AdminBadge variant={windowStatus.variant}>{windowStatus.label}</AdminBadge></dd>
          </div>
          <div className="aim-deadline-row">
            <dt>Opens At</dt>
            <dd>{formatDisplay(deadline.opensAt)}</dd>
          </div>
          <div className="aim-deadline-row">
            <dt>Closes At</dt>
            <dd>{formatDisplay(deadline.closesAt)}</dd>
          </div>
          <div className="aim-deadline-row">
            <dt>Late Submission</dt>
            <dd style={{ textTransform: 'capitalize' }}>{deadline.lateSubmissionPolicy === 'none' ? 'Not allowed' : deadline.lateSubmissionPolicy === 'penalty' ? 'With penalty' : 'Allowed'}</dd>
          </div>
          {deadline.lateSubmissionPolicy === 'penalty' && (
            <>
              <div className="aim-deadline-row">
                <dt>Late Penalty</dt>
                <dd>{deadline.latePenaltyPercent != null ? `${deadline.latePenaltyPercent}%` : '—'}</dd>
              </div>
              <div className="aim-deadline-row">
                <dt>Late Window</dt>
                <dd>{deadline.lateWindowMinutes != null ? `${deadline.lateWindowMinutes} minutes` : '—'}</dd>
              </div>
            </>
          )}
        </dl>

        {!disabled && (
          <div style={{ marginBlockStart: 'var(--space-16)' }}>
            <AdminButton variant="primary" onClick={() => setEditing(true)}>
              Edit Deadline
            </AdminButton>
          </div>
        )}

        <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-16)' }}>
          <strong>Backend authority:</strong> Deadline enforcement, late penalty
          calculation, and window status are determined by the backend only.
        </div>

        <style>{`
          .aim-deadline-grid {
            display: grid;
            gap: var(--space-12);
            margin: 0;
          }
          .aim-deadline-row {
            display: grid;
            grid-template-columns: 160px 1fr;
            gap: var(--space-8);
            align-items: start;
          }
          .aim-deadline-row dt {
            font-weight: var(--weight-semibold);
            font-size: 13px;
            color: var(--text-secondary);
          }
          .aim-deadline-row dd {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Edit Deadline & Availability">
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField id="d-opens" label="Opens At" hint="Leave empty for immediate availability.">
          <AdminInput
            id="d-opens"
            type="datetime-local"
            value={opensAt}
            onChange={(e) => setOpensAt(e.target.value)}
            disabled={isPending}
          />
        </AdminFormField>

        <AdminFormField id="d-closes" label="Closes At" error={fieldErrors.closesAt} hint="Leave empty for no deadline.">
          <AdminInput
            id="d-closes"
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            disabled={isPending}
            hasError={!!fieldErrors.closesAt}
          />
        </AdminFormField>

        <AdminFormField id="d-late-policy" label="Late Submission Policy">
          <AdminSelect
            id="d-late-policy"
            value={latePolicy}
            onChange={(e) => setLatePolicy(e.target.value as 'none' | 'penalty' | 'allow')}
            disabled={isPending}
          >
            <option value="none">Not Allowed</option>
            <option value="penalty">Allowed with Penalty</option>
            <option value="allow">Allowed without Penalty</option>
          </AdminSelect>
        </AdminFormField>

        {latePolicy === 'penalty' && (
          <>
            <AdminFormField id="d-late-penalty" label="Late Penalty (%)" error={fieldErrors.latePenalty}>
              <AdminInput
                id="d-late-penalty"
                type="number"
                value={latePenalty}
                onChange={(e) => setLatePenalty(e.target.value)}
                placeholder="e.g. 10"
                disabled={isPending}
                min={0}
                max={100}
                hasError={!!fieldErrors.latePenalty}
              />
            </AdminFormField>

            <AdminFormField id="d-late-window" label="Late Window (minutes)" error={fieldErrors.lateWindow}>
              <AdminInput
                id="d-late-window"
                type="number"
                value={lateWindow}
                onChange={(e) => setLateWindow(e.target.value)}
                placeholder="e.g. 60"
                disabled={isPending}
                min={1}
                hasError={!!fieldErrors.lateWindow}
              />
            </AdminFormField>
          </>
        )}

        {latePolicy === 'allow' && (
          <AdminFormField id="d-late-window-allow" label="Late Window (minutes)" error={fieldErrors.lateWindow} hint="Optional max time after deadline.">
            <AdminInput
              id="d-late-window-allow"
              type="number"
              value={lateWindow}
              onChange={(e) => setLateWindow(e.target.value)}
              placeholder="Leave empty for unlimited"
              disabled={isPending}
              min={1}
            />
          </AdminFormField>
        )}
      </div>

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Deadline enforcement and late penalty
        calculations are performed by the backend only.
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
        <AdminButton variant="primary" onClick={handleSave} disabled={isPending} loading={isPending}>
          Save Deadline
        </AdminButton>
        <AdminButton variant="secondary" onClick={handleCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>
    </AdminCard>
  );
}
