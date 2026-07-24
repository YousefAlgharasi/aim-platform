// P11-009: AIM design system input, textarea, and select components
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

const baseInputClass =
  'w-full h-11 px-3 border rounded-lg bg-[var(--surface)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] hover:enabled:border-[var(--border-strong)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--focus-ring)] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)] disabled:cursor-not-allowed transition-colors';

/* ---- Input ---- */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly hasError?: boolean;
};

export function AdminInput({ hasError, className = '', ...rest }: InputProps) {
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-200'
    : 'border-[var(--border)]';
  return (
    <input
      className={`${baseInputClass} ${errorClass} ${className}`}
      {...rest}
    />
  );
}

/* ---- Textarea ---- */
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  readonly hasError?: boolean;
};

export function AdminTextarea({ hasError, className = '', ...rest }: TextareaProps) {
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-200'
    : 'border-[var(--border)]';
  return (
    <textarea
      className={`${baseInputClass} h-auto min-h-[96px] p-3 resize-y ${errorClass} ${className}`}
      {...rest}
    />
  );
}

/* ---- Select ---- */
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  readonly hasError?: boolean;
};

export function AdminSelect({ hasError, className = '', children, ...rest }: SelectProps) {
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-200'
    : 'border-[var(--border)]';
  return (
    <select
      className={`${baseInputClass} cursor-pointer pr-10 bg-no-repeat bg-[right_0.75rem_center] ${errorClass} ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8499' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}
