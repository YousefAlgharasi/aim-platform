export type AdminNavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
};

export const adminNavigationItems: readonly AdminNavigationItem[] = [
  {
    label: 'Overview',
    href: '/admin',
    description: 'Shell landing',
  },
  {
    label: 'Students',
    href: '/admin/students',
    description: 'Placeholder only',
  },
  {
    label: 'Content',
    href: '/admin/content',
    description: 'Placeholder only',
  },
  {
    label: 'Reviews',
    href: '/admin/reviews',
    description: 'Placeholder only',
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    description: 'Placeholder only',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    description: 'Placeholder only',
  },
];
