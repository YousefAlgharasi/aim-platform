import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-answer{
  display:flex; align-items:center; gap: var(--space-12); width:100%;
  padding: var(--space-16); text-align:start; box-sizing:border-box;
  background: var(--surface); border:1.5px solid var(--border);
  border-radius: var(--radius-md); cursor:pointer;
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
  transition: border-color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}
.aim-answer:hover:not(:disabled){ border-color: var(--color-primary-300); background: var(--color-primary-50); }
.aim-answer:active:not(:disabled){ transform: scale(0.99); }
.aim-answer:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-answer:disabled{ cursor:default; }
.aim-answer__key{
  flex-shrink:0; width:28px; height:28px; border-radius: var(--radius-sm);
  display:inline-flex; align-items:center; justify-content:center;
  background: var(--surface-sunken); color: var(--text-secondary);
  font: var(--type-label); font-weight:700;
  transition: background var(--duration-fast), color var(--duration-fast);
}
.aim-answer__text{ flex:1; min-width:0; }
.aim-answer__mark{ flex-shrink:0; display:inline-flex; }

/* selected (before grading) */
.aim-answer--selected{ border-color: var(--color-primary-500); background: var(--color-primary-50); }
.aim-answer--selected .aim-answer__key{ background: var(--color-primary-500); color:#fff; }

/* correct */
.aim-answer--correct{ border-color: var(--color-success-500); background: var(--success-soft); }
.aim-answer--correct .aim-answer__key{ background: var(--color-success-500); color:#fff; }
.aim-answer--correct .aim-answer__mark{ color: var(--color-success-600); }

/* incorrect */
.aim-answer--incorrect{ border-color: var(--color-error-500); background: var(--error-soft); }
.aim-answer--incorrect .aim-answer__key{ background: var(--color-error-500); color:#fff; }
.aim-answer--incorrect .aim-answer__mark{ color: var(--color-error-600); }

/* the correct answer revealed when user chose wrong */
.aim-answer--reveal{ border-color: var(--color-success-500); border-style:dashed; background: var(--surface); }
.aim-answer--reveal .aim-answer__mark{ color: var(--color-success-600); }
`;

const Check = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Cross = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>;

/**
 * Quiz answer choice. `state` drives the look:
 * default · selected · correct · incorrect · reveal (the right answer
 * highlighted after a wrong pick). `optionKey` shows A/B/C/D.
 */
export function AnswerOption({ state = 'default', optionKey, disabled, className = '', children, ...rest }) {
  useScopedStyles('aim-answer-styles', CSS);
  const cls = ['aim-answer', state !== 'default' ? `aim-answer--${state}` : '', className].filter(Boolean).join(' ');
  const mark = state === 'correct' || state === 'reveal' ? Check : state === 'incorrect' ? Cross : null;
  const graded = ['correct', 'incorrect', 'reveal'].includes(state);
  return (
    <button type="button" className={cls} disabled={disabled || graded} aria-pressed={state === 'selected'} {...rest}>
      {optionKey && <span className="aim-answer__key" aria-hidden="true">{optionKey}</span>}
      <span className="aim-answer__text">{children}</span>
      {mark && <span className="aim-answer__mark" aria-hidden="true">{mark}</span>}
    </button>
  );
}
