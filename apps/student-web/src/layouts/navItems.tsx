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
  MicIcon,
  PencilIcon,
  TrendingUpIcon,
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

function RouteIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
    </svg>
  );
}

function RetryIcon({ className = 'size-5' }: { className?: string }) {
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
    title: 'Main',
    items: [
      { to: '/', label: 'Dashboard', icon: icon(HomeIcon) },
      { to: '/placement', label: 'Placement Test', icon: icon(ClipboardIcon) },
    ],
  },
  {
    title: 'Learning & Practice',
    items: [
      { to: '/curriculum', label: 'Courses', icon: icon(BookIcon) },
      { to: '/assessments', label: 'Assessments', icon: icon(PencilIcon) },
      { to: '/ai-teacher', label: 'AI Teacher', icon: icon(ChatIcon) },
      { to: '/voice-teacher', label: 'Voice Teacher', icon: icon(MicIcon) },
      { to: '/practice/speaking', label: 'Practice Speaking', icon: icon(MicIcon) },
      { to: '/practice/writing', label: 'Write a Paragraph', icon: icon(PencilIcon) },
      { to: '/vocabulary', label: 'My words', icon: icon(LightbulbIcon) },
      { to: '/mistakes', label: 'My mistakes', icon: icon(RetryIcon) },
    ],
  },
  {
    title: 'Progress & Achievements',
    items: [
      { to: '/progress', label: 'Progress', icon: icon(ChartIcon) },
      { to: '/journey', label: 'My journey', icon: icon(RouteIcon) },
      { to: '/achievements', label: 'Achievements', icon: icon(TrophyIcon) },
      { to: '/certificates', label: 'Certificates', icon: icon(AcademicIcon) },
      { to: '/reports', label: 'Reports', icon: icon(TrendingUpIcon) },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      { to: '/notifications', label: 'Notifications', icon: icon(BellIcon) },
      { to: '/billing/payments', label: 'My payments', icon: icon(CreditCardIcon) },
      { to: '/support', label: 'Support', icon: icon(LifeBuoyIcon) },
      { to: '/settings', label: 'Settings', icon: icon(UserIcon) },
    ],
  },
];

/** Flat list (used for page-title lookup). */
export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
