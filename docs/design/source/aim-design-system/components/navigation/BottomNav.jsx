import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-bottomnav{
  display:flex; align-items:stretch; justify-content:space-around;
  height: var(--bottom-nav-height); background: var(--surface);
  border-top:1px solid var(--border); box-shadow: var(--shadow-sheet);
  font-family: var(--font-sans); padding-bottom: env(safe-area-inset-bottom, 0);
}
.aim-bottomnav__item{
  flex:1; appearance:none; border:none; background:transparent; cursor:pointer;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  color: var(--text-muted); position:relative; min-width:0;
  transition: color var(--duration-fast) var(--ease-standard);
}
.aim-bottomnav__item:hover{ color: var(--text-secondary); }
.aim-bottomnav__item--active{ color: var(--color-primary-600); }
.aim-bottomnav__icon{ display:inline-flex; position:relative; }
.aim-bottomnav__label{ font: var(--type-caption); font-weight:600; }
.aim-bottomnav__badge{
  position:absolute; top:-4px; inset-inline-end:-7px; min-width:16px; height:16px; padding:0 4px;
  background: var(--color-error-500); color:#fff; border-radius: var(--radius-pill);
  font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center;
  border:2px solid var(--surface); box-sizing:content-box;
}
.aim-bottomnav__item:focus-visible{ outline:none; box-shadow: inset 0 0 0 2px var(--focus-ring); border-radius: var(--radius-sm); }
`;

/** Mobile bottom navigation bar. `items` are {value,label,icon,activeIcon?,badge?}. */
export function BottomNav({ items = [], value, onChange, className = '' }) {
  useScopedStyles('aim-bottomnav-styles', CSS);
  return (
    <nav className={['aim-bottomnav', className].filter(Boolean).join(' ')}>
      {items.map(it => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            className={['aim-bottomnav__item', active ? 'aim-bottomnav__item--active' : ''].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange && onChange(it.value)}
          >
            <span className="aim-bottomnav__icon" aria-hidden="true">
              {active && it.activeIcon ? it.activeIcon : it.icon}
              {it.badge != null && <span className="aim-bottomnav__badge">{it.badge}</span>}
            </span>
            <span className="aim-bottomnav__label">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
