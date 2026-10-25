import { ReactNode } from 'react';
import {
  AcademicIcon,
  BookIcon,
  ChartIcon,
  ChatIcon,
  ClipboardIcon,
  CreditCardIcon,
  HomeIcon,
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

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <HomeIcon className="size-5" /> },
  { to: '/placement', label: 'Placement Test', icon: <ClipboardIcon className="size-5" /> },
  { to: '/curriculum', label: 'Courses', icon: <BookIcon className="size-5" /> },
  { to: '/progress', label: 'Progress', icon: <ChartIcon className="size-5" /> },
  { to: '/assessments', label: 'Assessments', icon: <PencilIcon className="size-5" /> },
  { to: '/ai-teacher', label: 'AI Teacher', icon: <ChatIcon className="size-5" /> },
  { to: '/voice-teacher', label: 'Voice Teacher', icon: <MicIcon className="size-5" /> },
  { to: '/achievements', label: 'Achievements', icon: <TrophyIcon className="size-5" /> },
  { to: '/certificates', label: 'Certificates', icon: <AcademicIcon className="size-5" /> },
  { to: '/reports', label: 'Reports', icon: <TrendingUpIcon className="size-5" /> },
  { to: '/notifications', label: 'Notifications', icon: <BellIcon className="size-5" /> },
  { to: '/billing', label: 'Billing', icon: <CreditCardIcon className="size-5" /> },
  { to: '/support', label: 'Support', icon: <LifeBuoyIcon className="size-5" /> },
  { to: '/settings', label: 'Settings', icon: <UserIcon className="size-5" /> },
];

/** Bottom bar on phones: the five most-used destinations; everything else is in the menu drawer. */
export const mobileNavItems: NavItem[] = [
  { to: '/', label: 'Home', icon: <HomeIcon className="size-5" /> },
  { to: '/curriculum', label: 'Learn', icon: <BookIcon className="size-5" /> },
  { to: '/progress', label: 'Progress', icon: <ChartIcon className="size-5" /> },
  { to: '/ai-teacher', label: 'AI', icon: <ChatIcon className="size-5" /> },
  { to: '/profile', label: 'Profile', icon: <UserIcon className="size-5" /> },
];
