import type { ButtonHTMLAttributes } from 'react';
import { cva } from '../../lib/utils/cva';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly loading?: boolean;
};

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer select-none whitespace-nowrap transition-all active:enabled:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)] disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary-500)] text-[var(--text-on-primary)] hover:enabled:bg-[var(--color-primary-600)]',
        secondary:
          'bg-[var(--primary-soft)] text-[var(--color-primary-700)] hover:enabled:bg-[var(--color-primary-100)]',
        ghost:
          'bg-transparent text-[var(--text-secondary)] border border-[var(--border)] hover:enabled:bg-[var(--state-hover)] hover:enabled:text-[var(--text-primary)]',
        destructive:
          'bg-[var(--error-soft)] text-[var(--color-error-700)] hover:enabled:bg-[var(--color-error-100)]',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function AdminButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: Props) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
