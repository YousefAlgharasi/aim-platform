import * as React from 'react';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Show a text label beside the icon (extended FAB). */
  extended?: boolean;
  /** Use the AI gradient fill (default) vs. a solid primary fill. @default true */
  gradient?: boolean;
  /** Accessible label — required when there is no visible text. */
  ariaLabel?: string;
  /** Icon element. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Fab(props: FabProps): JSX.Element;
