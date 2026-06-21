import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-skel{ display:block; background:
  linear-gradient(90deg, var(--surface-sunken) 0%, var(--color-neutral-100) 50%, var(--surface-sunken) 100%);
  background-size: 200% 100%; animation: aim-shimmer 1.3s ease-in-out infinite; }
.aim-skel--text{ border-radius: var(--radius-xs); }
.aim-skel--rect{ border-radius: var(--radius-md); }
.aim-skel--circle{ border-radius: 50%; }
@keyframes aim-shimmer{ 0%{ background-position: 200% 0; } 100%{ background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce){ .aim-skel{ animation:none; } }
`;

/** Loading placeholder. Use shape + explicit width/height. */
export function Skeleton({ shape = 'text', width, height, lines = 1, className = '', style = {}, ...rest }) {
  useScopedStyles('aim-skel-styles', CSS);
  if (shape === 'text' && lines > 1) {
    return (
      <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }} {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="aim-skel aim-skel--text"
            style={{ height: height || 12, width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </span>
    );
  }
  const defaults = shape === 'circle'
    ? { width: width || 40, height: height || 40 }
    : shape === 'rect'
      ? { width: width || '100%', height: height || 80 }
      : { width: width || '100%', height: height || 12 };
  return <span className={['aim-skel', `aim-skel--${shape}`, className].filter(Boolean).join(' ')} style={{ ...defaults, ...style }} {...rest} />;
}
