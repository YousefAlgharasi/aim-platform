import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Control height. sm=36 · md=44 · lg=52. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the container width (mobile full-width buttons). */
  fullWidth?: boolean;
  /** Show a spinner and block interaction. */
  loading?: boolean;
  /** Disable the button. */
  disabled?: boolean;
  /** Icon element placed before the label (leading edge, RTL-aware). */
  leftIcon?: React.ReactNode;
  /** Icon element placed after the label (trailing edge, RTL-aware). */
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Primary button primitive for AIM.
 * @startingPoint section="Buttons" subtitle="All variants, sizes & states" viewport="700x180"
 */
export function Button(props: ButtonProps): JSX.Element;
