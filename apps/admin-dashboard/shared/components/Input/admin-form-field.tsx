import React, { useId as ReactUseId } from 'react';

type AdminFormFieldProps = {
  readonly id?: string;
  readonly label: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly children:
    | React.ReactNode
    | ((fieldProps: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode);
};

export function AdminFormField({
  id: customId,
  label,
  error,
  required = false,
  hint,
  children,
}: AdminFormFieldProps) {
  const generatedId = ReactUseId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ');

  const fieldProps = {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy || undefined,
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>

      {typeof children === 'function' ? children(fieldProps) : children}

      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
