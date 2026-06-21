import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-rec{ display:inline-flex; flex-direction:column; align-items:center; gap: var(--space-8); font-family: var(--font-sans); }
.aim-rec__btn{
  position:relative; width:72px; height:72px; border-radius: var(--radius-pill);
  border:none; cursor:pointer; color:#fff;
  background: var(--gradient-ai); box-shadow: var(--shadow-fab);
  display:flex; align-items:center; justify-content:center;
  transition: transform var(--duration-fast) var(--ease-standard), filter var(--duration-fast);
}
.aim-rec__btn:hover{ filter: brightness(1.05); }
.aim-rec__btn:active{ transform: scale(0.95); }
.aim-rec__btn:focus-visible{ outline:none; box-shadow: var(--shadow-fab), var(--shadow-focus); }
.aim-rec__btn:disabled{ background: var(--disabled-bg); color: var(--disabled-fg); box-shadow:none; cursor:not-allowed; }
.aim-rec--recording .aim-rec__btn{ background: var(--color-error-500); box-shadow: 0 4px 10px rgba(229,72,77,.3); }
/* pulsing rings while recording */
.aim-rec__pulse{ position:absolute; inset:0; border-radius:50%; border:2px solid var(--color-error-500); opacity:0; }
.aim-rec--recording .aim-rec__pulse{ animation: aim-pulse 1.6s ease-out infinite; }
.aim-rec--recording .aim-rec__pulse:nth-child(2){ animation-delay:.5s; }
@keyframes aim-pulse{ 0%{ transform: scale(1); opacity:.6; } 100%{ transform: scale(1.7); opacity:0; } }
@media (prefers-reduced-motion: reduce){ .aim-rec__pulse{ animation:none !important; } }
.aim-rec__caption{ font: var(--type-caption); color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.aim-rec--recording .aim-rec__caption{ color: var(--color-error-600); font-weight:600; }
`;

const Mic = <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg>;
const Stop = <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>;

/**
 * Speaking-practice record button. Pulses while recording. Provide
 * `recording`, optional `caption` (e.g. a timer), and `onToggle`.
 */
export function RecordButton({ recording = false, caption, disabled = false, onToggle, className = '', ...rest }) {
  useScopedStyles('aim-rec-styles', CSS);
  const defaultCaption = recording ? 'Tap to stop' : 'Tap to speak';
  return (
    <div className={['aim-rec', recording ? 'aim-rec--recording' : '', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="aim-rec__btn"
        aria-pressed={recording}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
        disabled={disabled}
        onClick={onToggle}
        {...rest}
      >
        <span className="aim-rec__pulse" aria-hidden="true" />
        <span className="aim-rec__pulse" aria-hidden="true" />
        {recording ? Stop : Mic}
      </button>
      <span className="aim-rec__caption">{caption != null ? caption : defaultCaption}</span>
    </div>
  );
}
