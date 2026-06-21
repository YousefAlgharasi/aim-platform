import * as React from 'react';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Visual style. @default 'ghost' */
  variant?: 'ghost' | 'solid' | 'soft' | 'outline';
  /** Size. sm=36 · md=44 · lg=52. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Fully rounded (pill) shape. */
  round?: boolean;
  disabled?: boolean;
  /** Accessible label — required, since the button has no text. */
  ariaLabel: string;
  /** The icon element (e.g. a 20px SVG). */
  children: React.ReactNode;
}

export function IconButton(props: IconButtonProps): JSX.Element;
