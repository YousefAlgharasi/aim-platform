import * as React from 'react';

export interface BottomNavItem {
  value: string;
  label: string;
  icon: React.ReactNode;
  /** Optional filled icon shown when active. */
  activeIcon?: React.ReactNode;
  /** Optional notification badge (number or string). */
  badge?: number | string;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function BottomNav(props: BottomNavProps): JSX.Element;
