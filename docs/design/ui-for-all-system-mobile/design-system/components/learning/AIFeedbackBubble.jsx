import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-aifb{ display:flex; gap: var(--space-12); align-items:flex-start; font-family: var(--font-sans); }
.aim-aifb__avatar{
  flex-shrink:0; width:36px; height:36px; border-radius: var(--radius-pill);
  background: var(--gradient-ai); color:#fff;
  display:flex; align-items:center; justify-content:center;
  box-shadow: var(--shadow-fab);
}
.aim-aifb__bubble{
  flex:1; min-width:0; position:relative;
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-lg); border-start-start-radius: var(--radius-xs);
  padding: var(--space-12) var(--space-16); box-shadow: var(--shadow-card);
}
.aim-aifb__name{ font: var(--type-label); color: var(--secondary-soft-fg); margin:0 0 4px; display:flex; align-items:center; gap: var(--space-8); }
.aim-aifb__msg{ font: var(--type-body-md); color: var(--text-primary); margin:0; }
.aim-aifb__msg :where(b,strong){ color: var(--color-primary-700); font-weight:600; }
.aim-aifb--tone-praise .aim-aifb__bubble{ border-color: var(--color-success-200, var(--color-success-100)); background: var(--success-soft); }
.aim-aifb--tone-correction .aim-aifb__bubble{ border-color: var(--color-warning-100); background: var(--warning-soft); }
/* typing indicator */
.aim-aifb__dots{ display:inline-flex; gap:4px; padding:4px 2px; }
.aim-aifb__dots span{ width:7px; height:7px; border-radius:50%; background: var(--text-muted); animation: aim-typing 1.2s infinite ease-in-out; }
.aim-aifb__dots span:nth-child(2){ animation-delay:.15s; }
.aim-aifb__dots span:nth-child(3){ animation-delay:.3s; }
@keyframes aim-typing{ 0%,60%,100%{ transform: translateY(0); opacity:.5; } 30%{ transform: translateY(-4px); opacity:1; } }
@media (prefers-reduced-motion: reduce){ .aim-aifb__dots span{ animation:none; } }
`;

const Spark = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.7 4.9L18.6 8.6 13.7 10.3 12 15.2l-1.7-4.9L5.4 8.6l4.9-1.7z"/></svg>;

/**
 * AI tutor feedback message — a chat bubble with the AIM gradient avatar.
 * Set `typing` to show the animated typing indicator. `tone` tints the
 * bubble (neutral / praise / correction).
 */
export function AIFeedbackBubble({ name = 'AI Tutor', tone = 'neutral', typing = false, className = '', children, ...rest }) {
  useScopedStyles('aim-aifb-styles', CSS);
  return (
    <div className={['aim-aifb', `aim-aifb--tone-${tone}`, className].filter(Boolean).join(' ')} {...rest}>
      <div className="aim-aifb__avatar" aria-hidden="true">{Spark}</div>
      <div className="aim-aifb__bubble">
        <p className="aim-aifb__name">{name}</p>
        {typing
          ? <div className="aim-aifb__dots" aria-label="AI is typing"><span/><span/><span/></div>
          : <div className="aim-aifb__msg">{children}</div>}
      </div>
    </div>
  );
}
