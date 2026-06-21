import * as React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Placeholder shape. @default 'text' */
  shape?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
  /** For shape="text": number of stacked lines (last is shorter). */
  lines?: number;
}

export function Skeleton(props: SkeletonProps): JSX.Element;
