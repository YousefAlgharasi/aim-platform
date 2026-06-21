import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-fab{
  display:inline-flex; align-items:center; justify-content:center;
  gap: var(--space-8);
  height: var(--size-fab); min-width: var(--size-fab);
  padding-inline: 0;
  border:none; border-radius: var(--radius-pill);
  background: var(--gradient-ai); color:#fff;
  box-shadow: var(--shadow-fab); cursor:pointer; box-sizing:border-box;
  font: var(--type-button); font-family: var(--font-sans);
  transition: transform var(--duration-fast) var(--ease-standard),
              filter var(--duration-fast) var(--ease-standard);
}
.aim-fab:hover{ filter: brightness(1.05); transform: translateY(-1px); }
.aim-fab:active{ transform: scale(0.96); }
.aim-fab:focus-visible{ outline:none; box-shadow: var(--shadow-fab), var(--shadow-focus); }
.aim-fab--extended{ padding-inline: var(--space-20); }
.aim-fab--solid{ background: var(--color-primary-500); }
`;

/**
 * Floating action button — circular by default, or extended with a label.
 * Uses the AI gradient by default to signal an adaptive / AI action.
 */
export function Fab({
  extended = false,
  gradient = true,
  ariaLabel,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  useScopedStyles('aim-fab-styles', CSS);
  const cls = [
    'aim-fab',
    extended ? 'aim-fab--extended' : '',
    gradient ? '' : 'aim-fab--solid',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} aria-label={ariaLabel} {...rest}>
      {icon && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{icon}</span>}
      {extended && children && <span>{children}</span>}
    </button>
  );
}
