import * as React from 'react';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  /** Selected (filter) state. */
  selected?: boolean;
  /** Show a remove (×) affordance — fires onRemove. */
  removable?: boolean;
  disabled?: boolean;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  onRemove?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export function Chip(props: ChipProps): JSX.Element;
