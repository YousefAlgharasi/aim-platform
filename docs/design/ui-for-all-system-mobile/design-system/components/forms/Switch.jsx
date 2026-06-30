import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-switch{ display:inline-flex; align-items:center; gap: var(--space-12); cursor:pointer; font-family: var(--font-sans); }
.aim-switch input{ position:absolute; opacity:0; width:0; height:0; }
.aim-switch__track{
  width:44px; height:26px; flex-shrink:0; border-radius: var(--radius-pill);
  background: var(--color-neutral-300); padding:3px; box-sizing:border-box;
  transition: background var(--duration-base) var(--ease-standard);
}
.aim-switch__thumb{
  width:20px; height:20px; border-radius:50%; background:#fff;
  box-shadow: 0 1px 3px rgba(24,28,38,.3);
  transition: transform var(--duration-base) var(--ease-emphasis);
}
.aim-switch input:checked ~ .aim-switch__track{ background: var(--color-primary-500); }
.aim-switch input:checked ~ .aim-switch__track .aim-switch__thumb{ transform: translateX(18px); }
[dir="rtl"] .aim-switch input:checked ~ .aim-switch__track .aim-switch__thumb{ transform: translateX(-18px); }
.aim-switch input:focus-visible ~ .aim-switch__track{ box-shadow: var(--shadow-focus); }
.aim-switch input:disabled ~ .aim-switch__track{ background: var(--disabled-bg); }
.aim-switch--disabled{ cursor:not-allowed; }
.aim-switch__label{ font: var(--type-body-md); color: var(--text-primary); }
`;

/** Toggle switch for on/off settings. */
export function Switch({ label, checked, disabled = false, id, className = '', ...rest }) {
  useScopedStyles('aim-switch-styles', CSS);
  const fieldId = id || React.useId();
  return (
    <label className={['aim-switch', disabled ? 'aim-switch--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" role="switch" checked={checked} disabled={disabled} {...rest} />
      <span className="aim-switch__track" aria-hidden="true"><span className="aim-switch__thumb" /></span>
      {label && <span className="aim-switch__label">{label}</span>}
    </label>
  );
}
