import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-radio{ display:inline-flex; align-items:center; gap: var(--space-12); cursor:pointer; font-family: var(--font-sans); }
.aim-radio input{ position:absolute; opacity:0; width:0; height:0; }
.aim-radio__dot{
  width:20px; height:20px; flex-shrink:0; border-radius:50%;
  border:1.5px solid var(--border-strong); background: var(--surface);
  display:inline-flex; align-items:center; justify-content:center;
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.aim-radio__dot::after{ content:''; width:10px; height:10px; border-radius:50%; background: var(--color-primary-500); transform: scale(0); transition: transform var(--duration-fast) var(--ease-emphasis); }
.aim-radio:hover input:not(:disabled) ~ .aim-radio__dot{ border-color: var(--color-primary-400); }
.aim-radio input:checked ~ .aim-radio__dot{ border-color: var(--color-primary-500); }
.aim-radio input:checked ~ .aim-radio__dot::after{ transform: scale(1); }
.aim-radio input:focus-visible ~ .aim-radio__dot{ box-shadow: var(--shadow-focus); }
.aim-radio input:disabled ~ .aim-radio__dot{ background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-radio input:disabled ~ .aim-radio__dot::after{ background: var(--disabled-fg); }
.aim-radio--disabled{ cursor:not-allowed; }
.aim-radio__label{ font: var(--type-body-md); color: var(--text-primary); }
`;

/** Single radio button with label. Group several with the same `name`. */
export function Radio({ label, checked, disabled = false, name, value, id, className = '', ...rest }) {
  useScopedStyles('aim-radio-styles', CSS);
  const fieldId = id || React.useId();
  return (
    <label className={['aim-radio', disabled ? 'aim-radio--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <input id={fieldId} type="radio" checked={checked} disabled={disabled} name={name} value={value} {...rest} />
      <span className="aim-radio__dot" aria-hidden="true" />
      {label && <span className="aim-radio__label">{label}</span>}
    </label>
  );
}
