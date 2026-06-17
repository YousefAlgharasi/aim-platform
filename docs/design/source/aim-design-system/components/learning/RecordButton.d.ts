import * as React from 'react';

export interface RecordButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  /** Whether recording is active (button pulses red, shows stop icon). */
  recording?: boolean;
  /** Caption under the button — defaults to a hint, override with a timer e.g. "0:12". */
  caption?: React.ReactNode;
  disabled?: boolean;
  /** Fired on tap (start/stop). */
  onToggle?: () => void;
  className?: string;
}

export function RecordButton(props: RecordButtonProps): JSX.Element;
