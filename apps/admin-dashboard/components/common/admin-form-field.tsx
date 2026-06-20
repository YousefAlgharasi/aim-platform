// P11-009: AIM design system form field wrapper
import type { ReactNode } from 'react';

type Props = {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly children: ReactNode;
};

export function AdminFormField({ id, label, required, hint, error, children }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`aim-field${error ? ' aim-field--error' : ''}`}>
      <label className="aim-field-label" htmlFor={id}>
        {label}
        {required && <span className="aim-field-required" aria-hidden="true"> *</span>}
      </label>
      <div
        className="aim-field-control"
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="aim-field-hint">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="aim-field-error" role="alert">{error}</p>
      )}
      <style>{`
        .aim-field { display: flex; flex-direction: column; gap: var(--space-4); }
        .aim-field-label {
          font-size: 14px;
          font-weight: var(--weight-medium);
          color: var(--text-primary);
          line-height: 20px;
        }
        .aim-field-required { color: var(--color-error-500); }
        .aim-field-control { display: flex; flex-direction: column; }
        .aim-field-hint { margin: 0; font-size: 13px; color: var(--text-muted); }
        .aim-field-error { margin: 0; font-size: 13px; color: var(--color-error-600); font-weight: var(--weight-medium); }
      `}</style>
    </div>
  );
}
