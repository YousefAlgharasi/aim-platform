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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--text-primary)] leading-5" htmlFor={id}>
        {label}
        {required && <span className="text-red-500" aria-hidden="true"> *</span>}
      </label>
      <div
        className="flex flex-col"
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-600 font-medium" role="alert">{error}</p>
      )}
    </div>
  );
}
