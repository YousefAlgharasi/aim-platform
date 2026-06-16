import * as React from 'react';

export interface SegmentItem { value: string; label: string; icon?: React.ReactNode; }

export interface SegmentedControlProps {
  /** Options as strings or {value,label,icon}. Best with 2–4. */
  items: Array<string | SegmentItem>;
  value: string;
  onChange?: (value: string) => void;
  /** Stretch to fill the container. */
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
