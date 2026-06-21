import * as React from 'react';

export interface TopAppBarProps {
  title?: string;
  /** Show a back chevron (auto-flips in RTL) and fire this on tap. */
  onBack?: () => void;
  /** Custom leading element (e.g. avatar) shown before the title. */
  leading?: React.ReactNode;
  /** Trailing action elements (e.g. IconButtons). */
  actions?: React.ReactNode;
  /** Center the title (iOS style). */
  centerTitle?: boolean;
  /** Transparent background (over a hero). */
  transparent?: boolean;
  className?: string;
}

export function TopAppBar(props: TopAppBarProps): JSX.Element;
