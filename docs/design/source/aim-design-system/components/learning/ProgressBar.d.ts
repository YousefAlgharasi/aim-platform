import * as React from 'react';

export interface ProgressBarProps {
  /** Current value. */
  value: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Label shown above the bar. */
  label?: string;
  /** Show a numeric/percentage readout. */
  showValue?: boolean;
  /** Fill color. gradient = growth gradient. @default 'primary' */
  tone?: 'primary' | 'gradient' | 'success' | 'warning';
  /** Track height. sm=5 · md=8 · lg=12. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Custom value formatter, e.g. (v,max)=>`${v}/${max} XP`. */
  valueFormat?: (value: number, max: number) => string;
  className?: string;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
