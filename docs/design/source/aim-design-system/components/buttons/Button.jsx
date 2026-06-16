import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-btn{
  --_h: var(--size-btn-md);
  display:inline-flex; align-items:center; justify-content:center;
  gap: var(--space-8);
  height: var(--_h); min-height: var(--_h);
  padding-inline: var(--space-20);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font: var(--type-button); font-family: var(--font-sans);
  letter-spacing: var(--type-button-tracking);
  cursor: pointer; user-select:none; white-space:nowrap;
  text-decoration:none; box-sizing:border-box;
  transition: background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}
.aim-btn:active{ transform: scale(0.97); }
.aim-btn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-btn[disabled], .aim-btn[aria-disabled="true"]{
  cursor:not-allowed; transform:none; box-shadow:none;
  background: var(--disabled-bg) !important; color: var(--disabled-fg) !important;
  border-color: var(--disabled-border) !important;
}
.aim-btn--sm{ --_h: var(--size-btn-sm); padding-inline: var(--space-16); border-radius: var(--radius-sm); font-size: var(--type-body-sm-size); }
.aim-btn--lg{ --_h: var(--size-btn-lg); padding-inline: var(--space-24); font-size: var(--type-body-md-size); }
.aim-btn--block{ display:flex; width:100%; }

.aim-btn--primary{ background: var(--color-primary-500); color: var(--text-on-primary); }
.aim-btn--primary:hover{ background: var(--color-primary-600); }
.aim-btn--primary:active{ background: var(--color-primary-700); }

.aim-btn--secondary{ background: var(--color-secondary-500); color:#fff; }
.aim-btn--secondary:hover{ background: var(--color-secondary-600); }
.aim-btn--secondary:active{ background: var(--color-secondary-700); }

.aim-btn--outline{ background: transparent; color: var(--color-primary-600); border-color: var(--border-strong); }
.aim-btn--outline:hover{ background: var(--color-primary-50); border-color: var(--color-primary-300); }
.aim-btn--outline:active{ background: var(--color-primary-100); }

.aim-btn--ghost{ background: transparent; color: var(--color-primary-600); }
.aim-btn--ghost:hover{ background: var(--color-primary-50); }
.aim-btn--ghost:active{ background: var(--color-primary-100); }

.aim-btn--destructive{ background: var(--color-error-500); color:#fff; }
.aim-btn--destructive:hover{ background: var(--color-error-600); }
.aim-btn--destructive:active{ background: var(--color-error-700); }

.aim-btn__spinner{ width:1em; height:1em; border-radius:50%;
  border:2px solid currentColor; border-top-color:transparent;
  animation: aim-spin 0.7s linear infinite; }
.aim-btn--loading .aim-btn__label, .aim-btn--loading .aim-btn__icon{ visibility:hidden; }
.aim-btn--loading{ position:relative; }
.aim-btn--loading .aim-btn__spinner{ position:absolute; }
@keyframes aim-spin{ to{ transform:rotate(360deg); } }
`;

/**
 * AIM primary button primitive. Supports 5 variants, 3 sizes, icons,
 * loading and disabled states. Direction-agnostic (works in RTL).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  useScopedStyles('aim-btn-styles', CSS);
  const cls = [
    'aim-btn',
    `aim-btn--${variant}`,
    size !== 'md' ? `aim-btn--${size}` : '',
    fullWidth ? 'aim-btn--block' : '',
    loading ? 'aim-btn--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="aim-btn__spinner" aria-hidden="true" />}
      {leftIcon && <span className="aim-btn__icon" aria-hidden="true">{leftIcon}</span>}
      <span className="aim-btn__label">{children}</span>
      {rightIcon && <span className="aim-btn__icon" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}
