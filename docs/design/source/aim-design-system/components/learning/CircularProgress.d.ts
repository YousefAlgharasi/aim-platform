import * as React from 'react';

export interface CircularProgressProps {
  value: number;
  /** @default 100 */
  max?: number;
  /** Diameter in px. @default 96 */
  size?: number;
  /** Stroke width in px. @default 9 */
  thickness?: number;
  /** Ring color. gradient = accent→primary. @default 'primary' */
  tone?: 'primary' | 'gradient' | 'success';
  /** Custom center content (overrides the % readout). */
  label?: React.ReactNode;
  /** Small caption under the value. */
  caption?: string;
  /** Show the % value in the center. @default true */
  showValue?: boolean;
  className?: string;
}

export function CircularProgress(props: CircularProgressProps): JSX.Element;
