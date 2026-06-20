// P11-009: AIM design system input and select components
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

/* ---- Input ---- */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly hasError?: boolean;
};

export function AdminInput({ hasError, className = '', ...rest }: InputProps) {
  return (
    <>
      <input
        className={`aim-input${hasError ? ' aim-input--error' : ''} ${className}`}
        {...rest}
      />
      <style>{`
        .aim-input {
          width: 100%;
          height: var(--size-input);
          padding: 0 var(--space-12);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          line-height: 20px;
          box-shadow: var(--shadow-inset);
          transition: border-color var(--duration-fast) var(--ease-standard),
                      box-shadow var(--duration-fast) var(--ease-standard);
        }
        .aim-input::placeholder { color: var(--text-muted); }
        .aim-input:hover:not(:disabled) { border-color: var(--border-strong); }
        .aim-input:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: var(--shadow-focus);
        }
        .aim-input:disabled {
          background: var(--disabled-bg);
          color: var(--disabled-fg);
          cursor: not-allowed;
        }
        .aim-input--error { border-color: var(--color-error-500); }
        .aim-input--error:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error-500) 30%, transparent); }
      `}</style>
    </>
  );
}

/* ---- Textarea ---- */
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  readonly hasError?: boolean;
};

export function AdminTextarea({ hasError, className = '', ...rest }: TextareaProps) {
  return (
    <>
      <textarea
        className={`aim-input aim-textarea${hasError ? ' aim-input--error' : ''} ${className}`}
        {...rest}
      />
      <style>{`
        .aim-textarea {
          height: auto;
          min-height: 96px;
          padding: var(--space-12);
          resize: vertical;
        }
      `}</style>
    </>
  );
}

/* ---- Select ---- */
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  readonly hasError?: boolean;
};

export function AdminSelect({ hasError, className = '', children, ...rest }: SelectProps) {
  return (
    <>
      <select
        className={`aim-input aim-select${hasError ? ' aim-input--error' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <style>{`
        .aim-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8499' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right var(--space-12) center;
          padding-inline-end: var(--space-40);
          cursor: pointer;
        }
        [dir="rtl"] .aim-select {
          background-position: left var(--space-12) center;
          padding-inline-end: var(--space-12);
          padding-inline-start: var(--space-40);
        }
      `}</style>
    </>
  );
}
