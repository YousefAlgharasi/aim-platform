import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-iconbtn{
  --_s: var(--size-icon-btn);
  display:inline-flex; align-items:center; justify-content:center;
  width:var(--_s); height:var(--_s); padding:0;
  border-radius: var(--radius-md); border:1px solid transparent;
  background:transparent; color: var(--text-secondary);
  cursor:pointer; box-sizing:border-box;
  transition: background var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}
.aim-iconbtn:active{ transform: scale(0.92); }
.aim-iconbtn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-iconbtn[disabled]{ cursor:not-allowed; color:var(--disabled-fg) !important; background:transparent !important; }
.aim-iconbtn--sm{ --_s: var(--size-btn-sm); border-radius: var(--radius-sm); }
.aim-iconbtn--lg{ --_s: var(--size-btn-lg); }
.aim-iconbtn--round{ border-radius: var(--radius-pill); }

.aim-iconbtn--ghost:hover{ background: var(--surface-sunken); color: var(--text-primary); }
.aim-iconbtn--solid{ background: var(--color-primary-500); color:#fff; }
.aim-iconbtn--solid:hover{ background: var(--color-primary-600); }
.aim-iconbtn--soft{ background: var(--primary-soft); color: var(--primary-soft-fg); }
.aim-iconbtn--soft:hover{ background: var(--color-primary-100); }
.aim-iconbtn--outline{ border-color: var(--border-strong); color: var(--text-secondary); }
.aim-iconbtn--outline:hover{ background: var(--surface-sunken); color: var(--text-primary); }
`;

/**
 * Square/round icon-only button. Provide an accessible label via `ariaLabel`.
 */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  round = false,
  disabled = false,
  ariaLabel,
  className = '',
  children,
  ...rest
}) {
  useScopedStyles('aim-iconbtn-styles', CSS);
  const cls = [
    'aim-iconbtn',
    `aim-iconbtn--${variant}`,
    size !== 'md' ? `aim-iconbtn--${size}` : '',
    round ? 'aim-iconbtn--round' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} disabled={disabled} aria-label={ariaLabel} {...rest}>
      {children}
    </button>
  );
}
