import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-badge{
  display:inline-flex; align-items:center; gap: var(--space-4);
  font: var(--type-caption); font-family: var(--font-sans); font-weight:600;
  padding: 3px var(--space-8); border-radius: var(--radius-sm);
  border:1px solid transparent; white-space:nowrap; line-height:1.4;
}
.aim-badge--pill{ border-radius: var(--radius-pill); padding-inline: var(--space-12); }
.aim-badge__dot{ width:6px; height:6px; border-radius:50%; background: currentColor; flex-shrink:0; }
/* soft (default) */
.aim-badge--soft.aim-badge--primary{ background:var(--primary-soft); color:var(--primary-soft-fg); }
.aim-badge--soft.aim-badge--secondary{ background:var(--secondary-soft); color:var(--secondary-soft-fg); }
.aim-badge--soft.aim-badge--accent{ background:var(--accent-soft); color:var(--accent-soft-fg); }
.aim-badge--soft.aim-badge--success{ background:var(--success-soft); color:var(--success-soft-fg); }
.aim-badge--soft.aim-badge--warning{ background:var(--warning-soft); color:var(--warning-soft-fg); }
.aim-badge--soft.aim-badge--error{ background:var(--error-soft); color:var(--error-soft-fg); }
.aim-badge--soft.aim-badge--info{ background:var(--info-soft); color:var(--info-soft-fg); }
.aim-badge--soft.aim-badge--neutral{ background:var(--surface-sunken); color:var(--text-secondary); }
/* solid */
.aim-badge--solid{ color:#fff; }
.aim-badge--solid.aim-badge--primary{ background:var(--color-primary-500); }
.aim-badge--solid.aim-badge--secondary{ background:var(--color-secondary-500); }
.aim-badge--solid.aim-badge--accent{ background:var(--color-accent-600); }
.aim-badge--solid.aim-badge--success{ background:var(--color-success-500); }
.aim-badge--solid.aim-badge--warning{ background:var(--color-warning-500); }
.aim-badge--solid.aim-badge--error{ background:var(--color-error-500); }
.aim-badge--solid.aim-badge--info{ background:var(--color-info-500); }
.aim-badge--solid.aim-badge--neutral{ background:var(--color-neutral-600); }
/* outline */
.aim-badge--outline{ background:transparent; }
.aim-badge--outline.aim-badge--primary{ color:var(--color-primary-600); border-color:var(--color-primary-200); }
.aim-badge--outline.aim-badge--success{ color:var(--success-soft-fg); border-color:var(--color-success-100); }
.aim-badge--outline.aim-badge--warning{ color:var(--warning-soft-fg); border-color:var(--color-warning-100); }
.aim-badge--outline.aim-badge--error{ color:var(--error-soft-fg); border-color:var(--color-error-100); }
.aim-badge--outline.aim-badge--neutral{ color:var(--text-secondary); border-color:var(--border-strong); }
`;

/**
 * Status badge / pill. Use `tone` for semantic meaning and `variant` for
 * weight. Covers AIM statuses: completed, in-progress, locked, new, etc.
 */
export function Badge({ tone = 'neutral', variant = 'soft', pill = false, dot = false, icon = null, className = '', children, ...rest }) {
  useScopedStyles('aim-badge-styles', CSS);
  const cls = ['aim-badge', `aim-badge--${variant}`, `aim-badge--${tone}`, pill ? 'aim-badge--pill' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot && <span className="aim-badge__dot" aria-hidden="true" />}
      {icon && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </span>
  );
}
