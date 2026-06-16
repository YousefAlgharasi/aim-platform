import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  /** Render the indeterminate (mixed) state. */
  indeterminate?: boolean;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
