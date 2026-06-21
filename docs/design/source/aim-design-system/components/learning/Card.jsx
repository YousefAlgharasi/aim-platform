import React from 'react';
import { useScopedStyles } from '../_util/useScopedStyles.js';

const CSS = `
.aim-card{
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-lg); box-sizing:border-box;
  font-family: var(--font-sans); color: var(--text-primary);
  display:flex; flex-direction:column;
  transition: box-shadow var(--duration-base) var(--ease-standard),
              transform var(--duration-base) var(--ease-standard),
              border-color var(--duration-base) var(--ease-standard);
}
.aim-card--pad{ padding: var(--card-padding-lg); }
.aim-card--elevated{ border-color:transparent; box-shadow: var(--shadow-card); }
.aim-card--interactive{ cursor:pointer; }
.aim-card--interactive:hover{ box-shadow: var(--shadow-card-hover); transform: translateY(-2px); border-color: var(--color-primary-200); }
.aim-card--interactive:active{ transform: translateY(0); }
.aim-card--interactive:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-card--ai{ border-color: transparent; background:
  linear-gradient(var(--surface), var(--surface)) padding-box,
  var(--gradient-ai) border-box; border:1.5px solid transparent; }
.aim-card--gradient{ background: var(--gradient-ai); color:#fff; border-color:transparent; }
`;

/**
 * Surface container. Variants: default (outlined), elevated (shadow),
 * ai (gradient ring — for AI-generated content), gradient (full AI fill).
 */
export function Card({ variant = 'default', padded = true, interactive = false, as = 'div', className = '', children, ...rest }) {
  useScopedStyles('aim-card-styles', CSS);
  const Tag = as;
  const cls = [
    'aim-card',
    padded ? 'aim-card--pad' : '',
    variant === 'elevated' ? 'aim-card--elevated' : '',
    variant === 'ai' ? 'aim-card--ai' : '',
    variant === 'gradient' ? 'aim-card--gradient' : '',
    interactive ? 'aim-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');
  const interactiveProps = interactive ? { tabIndex: 0, role: rest.onClick ? 'button' : undefined } : {};
  return <Tag className={cls} {...interactiveProps} {...rest}>{children}</Tag>;
}
