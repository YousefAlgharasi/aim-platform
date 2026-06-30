import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-appbar{
  display:flex; align-items:center; gap: var(--space-8);
  height: var(--top-bar-height); padding-inline: var(--space-8);
  background: var(--surface); border-bottom:1px solid var(--border);
  font-family: var(--font-sans);
}
.aim-appbar--transparent{ background:transparent; border-bottom-color:transparent; }
.aim-appbar__lead{ display:flex; align-items:center; }
.aim-appbar__title{
  flex:1; min-width:0; font: var(--type-h3); color: var(--text-primary);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  padding-inline: var(--space-8);
}
.aim-appbar--center .aim-appbar__title{ text-align:center; }
.aim-appbar__actions{ display:flex; align-items:center; gap: var(--space-4); }
.aim-appbar__btn{
  width: var(--size-icon-btn); height: var(--size-icon-btn);
  display:inline-flex; align-items:center; justify-content:center;
  border:none; background:transparent; color: var(--text-primary);
  border-radius: var(--radius-md); cursor:pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.aim-appbar__btn:hover{ background: var(--surface-sunken); }
.aim-appbar__btn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
[dir="rtl"] .aim-appbar__back{ transform: scaleX(-1); }
`;

const BackIcon = (
  <svg className="aim-appbar__back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
);

/** Top app bar with optional back button, title, and trailing actions. */
export function TopAppBar({ title, onBack, leading = null, actions = null, centerTitle = false, transparent = false, className = '' }) {
  useScopedStyles('aim-appbar-styles', CSS);
  const cls = ['aim-appbar', centerTitle ? 'aim-appbar--center' : '', transparent ? 'aim-appbar--transparent' : '', className].filter(Boolean).join(' ');
  return (
    <header className={cls}>
      <div className="aim-appbar__lead">
        {leading}
        {onBack && (
          <button className="aim-appbar__btn" type="button" aria-label="Back" onClick={onBack}>{BackIcon}</button>
        )}
      </div>
      <h1 className="aim-appbar__title">{title}</h1>
      <div className="aim-appbar__actions">{actions}</div>
    </header>
  );
}
