import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-ring{ display:inline-flex; align-items:center; justify-content:center; position:relative; font-family: var(--font-sans); }
.aim-ring svg{ transform: rotate(-90deg); }
.aim-ring__track{ stroke: var(--surface-sunken); }
.aim-ring__fill{ stroke: var(--color-primary-500); stroke-linecap: round; transition: stroke-dashoffset var(--duration-slow) var(--ease-standard); }
.aim-ring--gradient .aim-ring__fill{ stroke: url(#aimRingGrad); }
.aim-ring--success .aim-ring__fill{ stroke: var(--color-success-500); }
.aim-ring__label{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.aim-ring__value{ font: var(--type-h2); font-variant-numeric: tabular-nums; color: var(--text-primary); }
.aim-ring__cap{ font: var(--type-caption); color: var(--text-muted); margin-top:1px; }
`;

/** Circular progress ring. Good for daily-goal and quiz-score dials. */
export function CircularProgress({ value = 0, max = 100, size = 96, thickness = 9, tone = 'primary', label, caption, showValue = true, className = '' }) {
  useScopedStyles('aim-ring-styles', CSS);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const toneCls = tone === 'gradient' ? 'aim-ring--gradient' : tone === 'success' ? 'aim-ring--success' : '';
  return (
    <div className={['aim-ring', toneCls, className].filter(Boolean).join(' ')} style={{ width: size, height: size }}>
      <svg width={size} height={size} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <defs>
          <linearGradient id="aimRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-500)" />
            <stop offset="100%" stopColor="var(--color-primary-500)" />
          </linearGradient>
        </defs>
        <circle className="aim-ring__track" cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={thickness} />
        <circle className="aim-ring__fill" cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={thickness}
          strokeDasharray={c} strokeDashoffset={c - (pct/100) * c} />
      </svg>
      {(showValue || label || caption) && (
        <div className="aim-ring__label">
          {label != null ? label : (showValue && <span className="aim-ring__value">{Math.round(pct)}%</span>)}
          {caption && <span className="aim-ring__cap">{caption}</span>}
        </div>
      )}
    </div>
  );
}
