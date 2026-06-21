import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-ta-wrap{ display:flex; flex-direction:column; gap: var(--space-8); font-family: var(--font-sans); }
.aim-ta-label{ font: var(--type-label); color: var(--text-secondary); }
.aim-ta{
  width:100%; box-sizing:border-box; resize:vertical; min-height:96px;
  padding: var(--space-12) var(--space-16);
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-sm);
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-ta::placeholder{ color: var(--text-muted); }
.aim-ta:hover{ border-color: var(--border-strong); }
.aim-ta:focus{ outline:none; border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-ta:disabled{ background: var(--disabled-bg); color: var(--disabled-fg); }
.aim-ta--error{ border-color: var(--color-error-500); }
.aim-ta-helper{ font: var(--type-helper); color: var(--text-muted); display:flex; justify-content:space-between; gap: var(--space-8); }
.aim-ta-helper--error{ color: var(--color-error-600); }
`;

/** Multi-line text input with optional character count. */
export function Textarea({
  label, value, placeholder, helper, error, disabled = false,
  rows = 4, maxLength, id, className = '', ...rest
}) {
  useScopedStyles('aim-ta-styles', CSS);
  const fieldId = id || React.useId();
  const count = typeof value === 'string' ? value.length : 0;
  return (
    <div className={['aim-ta-wrap', className].filter(Boolean).join(' ')}>
      {label && <label className="aim-ta-label" htmlFor={fieldId}>{label}</label>}
      <textarea
        id={fieldId}
        className={['aim-ta', error ? 'aim-ta--error' : ''].filter(Boolean).join(' ')}
        value={value} placeholder={placeholder} rows={rows} disabled={disabled}
        maxLength={maxLength} aria-invalid={!!error} {...rest}
      />
      {(error || helper || maxLength) && (
        <div className={['aim-ta-helper', error ? 'aim-ta-helper--error' : ''].filter(Boolean).join(' ')}>
          <span>{error || helper}</span>
          {maxLength && <span>{count}/{maxLength}</span>}
        </div>
      )}
    </div>
  );
}
