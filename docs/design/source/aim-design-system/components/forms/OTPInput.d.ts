import * as React from 'react';

export interface OTPInputProps {
  /** Number of digit cells. @default 4 */
  length?: number;
  /** Current code value. */
  value?: string;
  onChange?: (code: string) => void;
  /** Fires when all cells are filled. */
  onComplete?: (code: string) => void;
  /** Error state (red borders). */
  error?: boolean;
  className?: string;
}

export function OTPInput(props: OTPInputProps): JSX.Element;
