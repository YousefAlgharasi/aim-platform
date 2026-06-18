import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-sel-wrap{ display:flex; flex-direction:column; gap: var(--space-8); font-family: var(--font-sans); }
.aim-sel-label{ font: var(--type-label); color: var(--text-secondary); }
.aim-sel{ position:relative; display:flex; align-items:center; }
.aim-sel select{
  appearance:none; -webkit-appearance:none; width:100%;
  height: var(--size-input); padding-inline: var(--space-16) var(--space-40);
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-sm); box-sizing:border-box;
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
  cursor:pointer;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-sel select:hover{ border-color: var(--border-strong); }
.aim-sel select:focus{ outline:none; border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-sel select:disabled{ background: var(--disabled-bg); color: var(--disabled-fg); cursor:not-allowed; }
.aim-sel__chev{ position:absolute; inset-inline-end: var(--space-12); pointer-events:none; color: var(--text-muted); display:flex; }
.aim-sel--error select{ border-color: var(--color-error-500); }
.aim-sel-helper{ font: var(--type-helper); color: var(--text-muted); }
.aim-sel-helper--error{ color: var(--color-error-600); }
`;

/** Native select dropdown styled to match AIM inputs. */
export function Select({
  label, value, onChange, options = [], placeholder, helper, error,
  disabled = false, id, className = '', children, ...rest
}) {
  useScopedStyles('aim-sel-styles', CSS);
  const fieldId = id || React.useId();
  return (
    <div className={['aim-sel-wrap', className].filter(Boolean).join(' ')}>
      {label && <label className="aim-sel-label" htmlFor={fieldId}>{label}</label>}
      <div className={['aim-sel', error ? 'aim-sel--error' : ''].filter(Boolean).join(' ')}>
        <select id={fieldId} value={value} onChange={onChange} disabled={disabled} aria-invalid={!!error} {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          ))}
          {children}
        </select>
        <span className="aim-sel__chev" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>
      {(error || helper) && <span className={['aim-sel-helper', error ? 'aim-sel-helper--error' : ''].filter(Boolean).join(' ')}>{error || helper}</span>}
    </div>
  );
}
