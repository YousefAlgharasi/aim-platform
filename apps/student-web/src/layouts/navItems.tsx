import { ComponentType, ReactNode } from 'react';
import {
  AcademicIcon,
  BookIcon,
  ChartIcon,
  ChatIcon,
  ClipboardIcon,
  CreditCardIcon,
  HomeIcon,
  LightbulbIcon,
  TrophyIcon,
  UserIcon,
} from '../components/common/Icons';

function BellIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function LifeBuoyIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
    </svg>
  );
}

export function TargetIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ZapNavIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function RetryIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
    </svg>
  );
}

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export interface NavSection {
  /** Translation key for the section heading. */
  title: string;
  items: NavItem[];
}

const icon = (C: ComponentType<{ className?: string }>) => <C className="size-5" />;

export const navSections: NavSection[] = [
  {
    title: 'Learn',
    items: [
      { to: '/', label: 'Dashboard', icon: icon(HomeIcon) },
      { to: '/curriculum', label: 'Courses', icon: icon(BookIcon) },
      { to: '/improve', label: 'Improve', icon: icon(TargetIcon) },
      { to: '/assessments', label: 'Assessments', icon: icon(ClipboardIcon) },
    ],
  },
  {
    title: 'Practice',
    items: [
      { to: '/practice', label: 'Practice', icon: icon(ZapNavIcon) },
      { to: '/ai-teacher', label: 'AI Teacher', icon: icon(ChatIcon) },
      { to: '/vocabulary', label: 'My words', icon: icon(LightbulbIcon) },
      { to: '/mistakes', label: 'My mistakes', icon: icon(RetryIcon) },
    ],
  },
  {
    title: 'Progress',
    items: [
      { to: '/progress', label: 'Progress', icon: icon(ChartIcon) },
      { to: '/achievements', label: 'Achievements', icon: icon(TrophyIcon) },
      { to: '/certificates', label: 'Certificates', icon: icon(AcademicIcon) },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/notifications', label: 'Notifications', icon: icon(BellIcon) },
      { to: '/billing', label: 'Billing', icon: icon(CreditCardIcon) },
      { to: '/support', label: 'Support', icon: icon(LifeBuoyIcon) },
      { to: '/settings', label: 'Settings', icon: icon(UserIcon) },
    ],
  },
];

/** The five destinations on the phone tab bar (everything else lives in the menu). */
export const tabItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: icon(HomeIcon) },
  { to: '/curriculum', label: 'Courses', icon: icon(BookIcon) },
  { to: '/improve', label: 'Improve', icon: icon(TargetIcon) },
  { to: '/practice', label: 'Practice', icon: icon(ZapNavIcon) },
];

/** Flat list (used for page-title lookup). */
export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
