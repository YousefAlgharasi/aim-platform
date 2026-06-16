import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-seg{
  display:inline-flex; position:relative; padding:3px; gap:0;
  background: var(--surface-sunken); border-radius: var(--radius-md);
  font-family: var(--font-sans);
}
.aim-seg--block{ display:flex; width:100%; }
.aim-seg__thumb{
  position:absolute; top:3px; bottom:3px; border-radius: calc(var(--radius-md) - 3px);
  background: var(--surface); box-shadow: var(--shadow-card);
  transition: left var(--duration-base) var(--ease-emphasis), width var(--duration-base) var(--ease-emphasis);
}
.aim-seg__btn{
  position:relative; z-index:1; flex:1; appearance:none; border:none; background:transparent;
  cursor:pointer; padding: var(--space-8) var(--space-16); white-space:nowrap;
  font: var(--type-button); font-family: var(--font-sans); color: var(--text-secondary);
  display:inline-flex; align-items:center; justify-content:center; gap: var(--space-8);
  transition: color var(--duration-base) var(--ease-standard);
}
.aim-seg__btn--active{ color: var(--color-primary-600); }
.aim-seg__btn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }
`;

/** Segmented control — single-select among 2–4 short options. */
export function SegmentedControl({ items = [], value, onChange, fullWidth = false, className = '' }) {
  useScopedStyles('aim-seg-styles', CSS);
  const ref = React.useRef(null);
  const [thumb, setThumb] = React.useState({ left: 3, width: 0 });
  const norm = items.map(it => typeof it === 'string' ? { value: it, label: it } : it);

  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const active = el.querySelector('.aim-seg__btn--active');
    if (active) setThumb({ left: active.offsetLeft, width: active.offsetWidth });
  }, [value, items, fullWidth]);

  return (
    <div ref={ref} className={['aim-seg', fullWidth ? 'aim-seg--block' : '', className].filter(Boolean).join(' ')} role="tablist">
      <span className="aim-seg__thumb" style={{ left: thumb.left, width: thumb.width }} />
      {norm.map(it => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          className={['aim-seg__btn', value === it.value ? 'aim-seg__btn--active' : ''].filter(Boolean).join(' ')}
          onClick={() => onChange && onChange(it.value)}
        >
          {it.icon && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{it.icon}</span>}
          {it.label}
        </button>
      ))}
    </div>
  );
}
