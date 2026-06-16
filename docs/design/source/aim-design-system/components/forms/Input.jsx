import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-field{ display:flex; flex-direction:column; gap: var(--space-8); font-family: var(--font-sans); }
.aim-field__label{ font: var(--type-label); color: var(--text-secondary); }
.aim-field__req{ color: var(--color-error-500); margin-inline-start: 2px; }
.aim-input{
  display:flex; align-items:center; gap: var(--space-8);
  height: var(--size-input); padding-inline: var(--space-16);
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-sm); box-sizing:border-box;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-input:hover{ border-color: var(--border-strong); }
.aim-input:focus-within{ border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-input__control{
  flex:1; min-width:0; border:none; outline:none; background:transparent;
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
}
.aim-input__control::placeholder{ color: var(--text-muted); }
.aim-input__icon{ display:inline-flex; color: var(--text-muted); flex-shrink:0; }
.aim-input__btn{ display:inline-flex; border:none; background:transparent; padding:0; cursor:pointer; color: var(--text-muted); }
.aim-input__btn:hover{ color: var(--text-secondary); }
.aim-input--sm{ height: var(--size-input-sm); }
.aim-field--error .aim-input{ border-color: var(--color-error-500); }
.aim-field--error .aim-input:focus-within{ box-shadow: 0 0 0 3px var(--error-soft); }
.aim-input--disabled{ background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-input--disabled .aim-input__control{ color: var(--disabled-fg); }
.aim-field__helper{ font: var(--type-helper); color: var(--text-muted); }
.aim-field--error .aim-field__helper{ color: var(--color-error-600); }
`;

/**
 * Text field with label, helper/error text, optional icons, and a built-in
 * show/hide toggle when type="password". Direction-agnostic.
 */
export function Input({
  label,
  type = 'text',
  size = 'md',
  value,
  placeholder,
  helper,
  error,
  required = false,
  disabled = false,
  leftIcon = null,
  id,
  className = '',
  ...rest
}) {
  useScopedStyles('aim-input-styles', CSS);
  const [show, setShow] = React.useState(false);
  const fieldId = id || React.useId();
  const isPassword = type === 'password';
  const effType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className={['aim-field', error ? 'aim-field--error' : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="aim-field__label" htmlFor={fieldId}>
          {label}{required && <span className="aim-field__req">*</span>}
        </label>
      )}
      <div className={['aim-input', size === 'sm' ? 'aim-input--sm' : '', disabled ? 'aim-input--disabled' : ''].filter(Boolean).join(' ')}>
        {leftIcon && <span className="aim-input__icon" aria-hidden="true">{leftIcon}</span>}
        <input
          id={fieldId}
          className="aim-input__control"
          type={effType}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          {...rest}
        />
        {isPassword && (
          <button type="button" className="aim-input__btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? EyeOff : Eye}
          </button>
        )}
      </div>
      {(error || helper) && <span className="aim-field__helper">{error || helper}</span>}
    </div>
  );
}

const Eye = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOff = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.9A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-3.1 3.9M6.1 6.1A18 18 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 2.6-.3"/></svg>
);
