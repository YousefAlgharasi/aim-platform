// P11-009: AIM design system button component
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly loading?: boolean;
};

const VARIANT_STYLES: Record<Variant, string> = {
  primary:     'aim-btn--primary',
  secondary:   'aim-btn--secondary',
  ghost:       'aim-btn--ghost',
  destructive: 'aim-btn--destructive',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'aim-btn--sm',
  md: 'aim-btn--md',
  lg: 'aim-btn--lg',
};

export function AdminButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <>
      <button
        className={`aim-btn ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <span className="aim-btn-spinner" aria-hidden="true" />}
        {children}
      </button>
      <style>{`
        .aim-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-8);
          border: none;
          border-radius: var(--radius-md);
          font-family: inherit;
          font-weight: var(--weight-semibold);
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: background var(--duration-fast) var(--ease-standard),
                      box-shadow var(--duration-fast) var(--ease-standard),
                      transform var(--duration-fast) var(--ease-standard);
        }
        .aim-btn:active:not(:disabled) { transform: scale(0.98); }
        .aim-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .aim-btn:disabled { background: var(--disabled-bg); color: var(--disabled-fg); cursor: not-allowed; }

        /* Sizes */
        .aim-btn--sm { height: var(--size-btn-sm); padding: 0 var(--space-12); font-size: 13px; }
        .aim-btn--md { height: var(--size-btn-md); padding: 0 var(--space-20); font-size: 14px; }
        .aim-btn--lg { height: 52px;               padding: 0 var(--space-24); font-size: 15px; }

        /* Variants */
        .aim-btn--primary {
          background: var(--color-primary-500);
          color: var(--text-on-primary);
        }
        .aim-btn--primary:hover:not(:disabled) { background: var(--color-primary-600); }

        .aim-btn--secondary {
          background: var(--primary-soft);
          color: var(--color-primary-700);
        }
        .aim-btn--secondary:hover:not(:disabled) { background: var(--color-primary-100); }

        .aim-btn--ghost {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .aim-btn--ghost:hover:not(:disabled) { background: var(--state-hover); color: var(--text-primary); }

        .aim-btn--destructive {
          background: var(--error-soft);
          color: var(--color-error-700);
        }
        .aim-btn--destructive:hover:not(:disabled) { background: var(--color-error-100); }

        /* Spinner */
        @keyframes aim-spin { to { transform: rotate(360deg); } }
        .aim-btn-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid currentColor;
          border-block-start-color: transparent;
          border-radius: 50%;
          animation: aim-spin 0.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aim-btn-spinner { animation: none; }
        }
      `}</style>
    </>
  );
}
