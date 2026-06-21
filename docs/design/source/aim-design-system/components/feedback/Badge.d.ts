import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. @default 'neutral' */
  tone?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /** Visual weight. @default 'soft' */
  variant?: 'soft' | 'solid' | 'outline';
  /** Fully rounded pill shape. */
  pill?: boolean;
  /** Show a leading status dot. */
  dot?: boolean;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Status badge / pill.
 * @startingPoint section="Feedback" subtitle="Badges, chips, alerts & skeletons" viewport="700x360"
 */
export function Badge(props: BadgeProps): JSX.Element;
