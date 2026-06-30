import * as React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label rendered above the control. */
  label?: string;
  /** Input type. password adds a built-in show/hide toggle. @default 'text' */
  type?: 'text' | 'password' | 'search' | 'email' | 'tel' | 'number';
  /** Height. md=48 · sm=40. @default 'md' */
  size?: 'sm' | 'md';
  /** Helper / hint text below the field. */
  helper?: string;
  /** Error message — turns the field red and overrides helper. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Icon shown at the leading edge (e.g. a search glyph). */
  leftIcon?: React.ReactNode;
}

/**
 * Labeled text field with validation + password reveal.
 * @startingPoint section="Forms" subtitle="Inputs, selects & controls" viewport="700x430"
 */
export function Input(props: InputProps): JSX.Element;
