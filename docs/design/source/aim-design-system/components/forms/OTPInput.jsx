import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-otp{ display:flex; gap: var(--space-12); direction:ltr; }
.aim-otp__cell{
  width:48px; height:56px; text-align:center;
  font: var(--type-h2); font-family: var(--font-sans); color: var(--text-primary);
  background: var(--surface); border:1.5px solid var(--border);
  border-radius: var(--radius-md); box-sizing:border-box;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-otp__cell:focus{ outline:none; border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-otp__cell--filled{ border-color: var(--color-primary-300); }
.aim-otp--error .aim-otp__cell{ border-color: var(--color-error-500); }
`;

/**
 * One-time-code input — `length` separate cells with auto-advance,
 * backspace and paste handling. Calls onChange(code) and onComplete(code).
 */
export function OTPInput({ length = 4, value = '', onChange, onComplete, error = false, className = '' }) {
  useScopedStyles('aim-otp-styles', CSS);
  const refs = React.useRef([]);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');

  const setAt = (i, ch) => {
    const next = chars.map((c, idx) => idx === i ? ch : c).join('').replace(/ /g, '');
    onChange && onChange(next);
    if (next.length === length) onComplete && onComplete(next);
  };

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) { setAt(i, ' '); return; }
    const digit = v[v.length - 1];
    setAt(i, digit);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && (chars[i] === ' ' || !chars[i]) && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    const data = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!data) return;
    e.preventDefault();
    onChange && onChange(data);
    if (data.length === length) { onComplete && onComplete(data); refs.current[length - 1]?.focus(); }
    else refs.current[data.length]?.focus();
  };

  return (
    <div className={['aim-otp', error ? 'aim-otp--error' : '', className].filter(Boolean).join(' ')} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          className={['aim-otp__cell', chars[i] && chars[i] !== ' ' ? 'aim-otp__cell--filled' : ''].filter(Boolean).join(' ')}
          inputMode="numeric"
          maxLength={1}
          value={chars[i] === ' ' ? '' : chars[i]}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
