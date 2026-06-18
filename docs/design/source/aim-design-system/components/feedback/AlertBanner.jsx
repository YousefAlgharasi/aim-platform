import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-alert{
  display:flex; gap: var(--space-12); align-items:flex-start;
  padding: var(--space-12) var(--space-16);
  border-radius: var(--radius-md); border:1px solid transparent;
  font-family: var(--font-sans);
}
.aim-alert__icon{ flex-shrink:0; display:inline-flex; margin-top:1px; }
.aim-alert__body{ flex:1; min-width:0; }
.aim-alert__title{ font: var(--type-title); font-size: var(--type-body-md-size); margin:0 0 2px; }
.aim-alert__msg{ font: var(--type-body-sm); margin:0; color: inherit; opacity:.92; }
.aim-alert__close{ flex-shrink:0; border:none; background:transparent; cursor:pointer; color:inherit; opacity:.6; padding:0; display:inline-flex; }
.aim-alert__close:hover{ opacity:1; }
.aim-alert--info{ background:var(--info-soft); color:var(--info-soft-fg); border-color: color-mix(in srgb, var(--color-info-500) 18%, transparent); }
.aim-alert--success{ background:var(--success-soft); color:var(--success-soft-fg); border-color: color-mix(in srgb, var(--color-success-500) 18%, transparent); }
.aim-alert--warning{ background:var(--warning-soft); color:var(--warning-soft-fg); border-color: color-mix(in srgb, var(--color-warning-500) 22%, transparent); }
.aim-alert--error{ background:var(--error-soft); color:var(--error-soft-fg); border-color: color-mix(in srgb, var(--color-error-500) 18%, transparent); }
`;

const ICONS = {
  info: <path d="M12 16v-5M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/>,
  success: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12l3 3 5-6"/>,
  warning: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>,
  error: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6"/>,
};

/** Inline alert / banner for contextual messages. */
export function AlertBanner({ tone = 'info', title, dismissible = false, onDismiss, action = null, className = '', children, ...rest }) {
  useScopedStyles('aim-alert-styles', CSS);
  return (
    <div className={['aim-alert', `aim-alert--${tone}`, className].filter(Boolean).join(' ')} role="alert" {...rest}>
      <span className="aim-alert__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[tone]}</svg>
      </span>
      <div className="aim-alert__body">
        {title && <p className="aim-alert__title">{title}</p>}
        {children && <p className="aim-alert__msg">{children}</p>}
        {action && <div style={{ marginTop: 'var(--space-8)' }}>{action}</div>}
      </div>
      {dismissible && (
        <button className="aim-alert__close" type="button" aria-label="Dismiss" onClick={onDismiss}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      )}
    </div>
  );
}
