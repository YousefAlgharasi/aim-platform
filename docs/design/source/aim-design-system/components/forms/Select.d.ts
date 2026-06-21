import * as React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  /** Options as strings or {value,label} objects. */
  options?: Array<string | SelectOption>;
  /** Disabled first option used as a placeholder. */
  placeholder?: string;
  helper?: string;
  error?: string;
}

export function Select(props: SelectProps): JSX.Element;
