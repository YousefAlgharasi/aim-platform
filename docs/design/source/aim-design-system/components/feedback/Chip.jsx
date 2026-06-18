import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-chip{
  display:inline-flex; align-items:center; gap: var(--space-8);
  height:34px; padding-inline: var(--space-16);
  font: var(--type-body-sm); font-family: var(--font-sans); font-weight:500;
  background: var(--surface); color: var(--text-secondary);
  border:1px solid var(--border); border-radius: var(--radius-pill);
  cursor:pointer; user-select:none; box-sizing:border-box;
  transition: background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}
.aim-chip:hover{ background: var(--surface-sunken); }
.aim-chip:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-chip--selected{ background: var(--primary-soft); color: var(--primary-soft-fg); border-color: var(--color-primary-200); }
.aim-chip--selected:hover{ background: var(--color-primary-100); }
.aim-chip--static{ cursor:default; }
.aim-chip[aria-disabled="true"]{ cursor:not-allowed; color: var(--disabled-fg); background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-chip__x{ display:inline-flex; margin-inline-end:-4px; border-radius:50%; padding:1px; }
.aim-chip__x:hover{ background: color-mix(in srgb, currentColor 16%, transparent); }
.aim-chip__icon{ display:inline-flex; }
`;

/**
 * Chip / tag — selectable (filter), removable, or static. For filter rows,
 * reminder chips, and tags.
 */
export function Chip({ selected = false, removable = false, disabled = false, icon = null, onRemove, onClick, className = '', children, ...rest }) {
  useScopedStyles('aim-chip-styles', CSS);
  const interactive = !!onClick || selected || removable;
  const cls = ['aim-chip', selected ? 'aim-chip--selected' : '', interactive ? '' : 'aim-chip--static', className].filter(Boolean).join(' ');
  return (
    <span
      className={cls}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {icon && <span className="aim-chip__icon" aria-hidden="true">{icon}</span>}
      {children}
      {removable && (
        <span className="aim-chip__x" role="button" aria-label="Remove" onClick={e => { e.stopPropagation(); onRemove && onRemove(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </span>
      )}
    </span>
  );
}
