import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Surface style. ai = gradient ring · gradient = full AI fill. @default 'default' */
  variant?: 'default' | 'elevated' | 'ai' | 'gradient';
  /** Apply standard inner padding. @default true */
  padded?: boolean;
  /** Add hover lift + focus ring for tappable cards. */
  interactive?: boolean;
  /** Render as a different element/tag. @default 'div' */
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * Surface container for lessons, stats, and AI content.
 * @startingPoint section="Learning" subtitle="Cards, progress, answers & AI feedback" viewport="760x640"
 */
export function Card(props: CardProps): JSX.Element;
