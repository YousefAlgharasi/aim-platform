import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-tabs{ font-family: var(--font-sans); }
.aim-tabs__list{ display:flex; gap: var(--space-4); border-bottom:1px solid var(--border); position:relative; }
.aim-tab{
  appearance:none; border:none; background:transparent; cursor:pointer;
  padding: var(--space-12) var(--space-16); position:relative;
  font: var(--type-button); font-family: var(--font-sans); color: var(--text-secondary);
  display:inline-flex; align-items:center; gap: var(--space-8);
  transition: color var(--duration-fast) var(--ease-standard);
}
.aim-tab:hover{ color: var(--text-primary); }
.aim-tab:focus-visible{ outline:none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }
.aim-tab--active{ color: var(--color-primary-600); }
.aim-tab__underline{
  position:absolute; bottom:-1px; height:2.5px; border-radius: var(--radius-pill);
  background: var(--color-primary-500);
  transition: left var(--duration-base) var(--ease-standard), width var(--duration-base) var(--ease-standard);
}
.aim-tab__count{ font-size: var(--type-caption-size); background: var(--surface-sunken); color: var(--text-secondary); border-radius: var(--radius-pill); padding: 0 7px; }
.aim-tab--active .aim-tab__count{ background: var(--primary-soft); color: var(--primary-soft-fg); }
`;

/**
 * Underlined tab bar with an animated active indicator. Controlled via
 * `value` + `onChange`. `items` are {value,label,count?,icon?}.
 */
export function Tabs({ items = [], value, onChange, className = '' }) {
  useScopedStyles('aim-tabs-styles', CSS);
  const listRef = React.useRef(null);
  const [ind, setInd] = React.useState({ left: 0, width: 0 });

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('.aim-tab--active');
    if (active) setInd({ left: active.offsetLeft, width: active.offsetWidth });
  }, [value, items]);

  return (
    <div className={['aim-tabs', className].filter(Boolean).join(' ')}>
      <div className="aim-tabs__list" role="tablist" ref={listRef}>
        {items.map(it => (
          <button
            key={it.value}
            role="tab"
            aria-selected={value === it.value}
            className={['aim-tab', value === it.value ? 'aim-tab--active' : ''].filter(Boolean).join(' ')}
            onClick={() => onChange && onChange(it.value)}
          >
            {it.icon && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{it.icon}</span>}
            {it.label}
            {it.count != null && <span className="aim-tab__count">{it.count}</span>}
          </button>
        ))}
        <span className="aim-tab__underline" style={{ left: ind.left, width: ind.width }} />
      </div>
    </div>
  );
}
