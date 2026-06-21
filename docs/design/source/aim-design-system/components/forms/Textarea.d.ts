import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  /** Error message — turns the field red and overrides helper. */
  error?: string;
  /** Shows a live character counter when set. */
  maxLength?: number;
}

export function Textarea(props: TextareaProps): JSX.Element;
