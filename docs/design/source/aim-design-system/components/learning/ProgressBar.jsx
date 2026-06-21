import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-progress{ font-family: var(--font-sans); }
.aim-progress__head{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom: var(--space-8); gap: var(--space-8); }
.aim-progress__label{ font: var(--type-label); color: var(--text-secondary); }
.aim-progress__value{ font: var(--type-label); color: var(--text-primary); font-variant-numeric: tabular-nums; }
.aim-progress__track{
  height: var(--_h, 8px); border-radius: var(--radius-pill);
  background: var(--surface-sunken); overflow:hidden;
}
.aim-progress__fill{
  height:100%; border-radius: var(--radius-pill); min-width: 0;
  background: var(--_fill, var(--color-primary-500));
  transition: width var(--duration-slow) var(--ease-standard);
}
.aim-progress--gradient .aim-progress__fill{ background: var(--gradient-growth); }
.aim-progress--success .aim-progress__fill{ background: var(--color-success-500); }
.aim-progress--warning .aim-progress__fill{ background: var(--color-warning-500); }
`;

/** Linear progress / XP bar (0–100). Optional label + value readout. */
export function ProgressBar({ value = 0, max = 100, label, showValue = false, tone = 'primary', size = 'md', valueFormat, className = '' }) {
  useScopedStyles('aim-progress-styles', CSS);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = size === 'lg' ? 12 : size === 'sm' ? 5 : 8;
  const toneCls = tone === 'gradient' ? 'aim-progress--gradient' : tone === 'success' ? 'aim-progress--success' : tone === 'warning' ? 'aim-progress--warning' : '';
  return (
    <div className={['aim-progress', toneCls, className].filter(Boolean).join(' ')}>
      {(label || showValue) && (
        <div className="aim-progress__head">
          {label && <span className="aim-progress__label">{label}</span>}
          {showValue && <span className="aim-progress__value">{valueFormat ? valueFormat(value, max) : `${Math.round(pct)}%`}</span>}
        </div>
      )}
      <div className="aim-progress__track" style={{ '--_h': `${h}px` }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="aim-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
