import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-check{ display:inline-flex; align-items:center; gap: var(--space-12); cursor:pointer; font-family: var(--font-sans); }
.aim-check input{ position:absolute; opacity:0; width:0; height:0; }
.aim-check__box{
  width:20px; height:20px; flex-shrink:0; border-radius: var(--radius-xs);
  border:1.5px solid var(--border-strong); background: var(--surface);
  display:inline-flex; align-items:center; justify-content:center; color:#fff;
  transition: background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}
.aim-check__box svg{ opacity:0; transform: scale(0.6); transition: all var(--duration-fast) var(--ease-emphasis); }
.aim-check:hover input:not(:disabled) ~ .aim-check__box{ border-color: var(--color-primary-400); }
.aim-check input:checked ~ .aim-check__box{ background: var(--color-primary-500); border-color: var(--color-primary-500); }
.aim-check input:checked ~ .aim-check__box svg{ opacity:1; transform: scale(1); }
.aim-check input:focus-visible ~ .aim-check__box{ box-shadow: var(--shadow-focus); }
.aim-check input:disabled ~ .aim-check__box{ background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-check input:disabled ~ .aim-check__label{ color: var(--disabled-fg); }
.aim-check--disabled{ cursor:not-allowed; }
.aim-check__label{ font: var(--type-body-md); color: var(--text-primary); }
`;

/** Checkbox with label. Supports indeterminate state. */
export function Checkbox({ label, checked, indeterminate = false, disabled = false, id, className = '', ...rest }) {
  useScopedStyles('aim-check-styles', CSS);
  const ref = React.useRef(null);
  const fieldId = id || React.useId();
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <label className={['aim-check', disabled ? 'aim-check--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <input ref={ref} id={fieldId} type="checkbox" checked={checked} disabled={disabled} {...rest} />
      <span className="aim-check__box" aria-hidden="true">
        {indeterminate
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 12h12"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
      </span>
      {label && <span className="aim-check__label">{label}</span>}
    </label>
  );
}
