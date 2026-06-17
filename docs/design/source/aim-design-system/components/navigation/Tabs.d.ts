import * as React from 'react';

export interface TabItem {
  value: string;
  label: string;
  /** Optional count badge. */
  count?: number;
  /** Optional leading icon. */
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Selected tab value (controlled). */
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * Underlined tab bar with animated indicator.
 * @startingPoint section="Navigation" subtitle="Tabs, segments, app & bottom bars" viewport="760x520"
 */
export function Tabs(props: TabsProps): JSX.Element;
