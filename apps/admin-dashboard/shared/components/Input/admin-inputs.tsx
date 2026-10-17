// P11-009: AIM design system input, textarea, and select components
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

type ControlSize = 'sm' | 'md';

const baseInputStyle =
  'w-full border rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] hover:enabled:border-[var(--border-strong)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--focus-ring)]/25 disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)] disabled:cursor-not-allowed transition-colors';

/* ---- Input ---- */
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  readonly hasError?: boolean;
  readonly size?: ControlSize;
};

export function AdminInput({ hasError, size = 'md', className = '', ...rest }: InputProps) {
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-200'
    : 'border-[var(--border)]';
  const sizeClass = size === 'sm' ? 'h-9 px-3 text-xs sm:text-sm' : 'h-11 px-3.5 text-sm';
  return (
    <input
      className={`${baseInputStyle} ${sizeClass} ${errorClass} ${className}`}
      {...rest}
    />
  );
}

/* ---- Textarea ---- */
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  readonly hasError?: boolean;
};

export function AdminTextarea({ hasError, className = '', ...rest }: TextareaProps) {
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-200'
    : 'border-[var(--border)]';
  return (
    <textarea
      className={`${baseInputStyle} h-auto min-h-[96px] p-3 text-sm resize-y ${errorClass} ${className}`}
      {...rest}
    />
  );
}

/* ---- Select ---- */
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  readonly hasError?: boolean;
  readonly size?: ControlSize;
};

export function AdminSelect({
  hasError,
  size = 'md',
  className = '',
  children,
  style,
  ...rest
}: SelectProps) {
  const errorClass = hasError
    ? 'border-red-500 focus:ring-red-200'
    : 'border-[var(--border)]';
  const sizeClass =
    size === 'sm'
      ? 'h-9 px-3 pr-8 text-xs sm:text-sm bg-[right_0.65rem_center]'
      : 'h-11 px-3.5 pr-10 text-sm bg-[right_0.75rem_center]';

  return (
    <select
      className={`${baseInputStyle} appearance-none cursor-pointer bg-no-repeat ${sizeClass} ${errorClass} ${className}`}
      style={{
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237A8499' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}
