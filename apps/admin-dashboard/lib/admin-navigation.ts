import type { AdminRoleKey } from './admin-roles';

export type AdminNavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
};

export type RoleBasedMenuGroup = {
  readonly role: AdminRoleKey;
  readonly items: readonly AdminNavigationItem[];
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
    description: 'Curriculum shell',
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
  {
    label: 'Audit Logs',
    href: '/admin/audit-logs',
    description: 'Placeholder only',
  },
  {
    label: 'Role menu',
    href: '/admin/roles',
    description: 'Placeholder only',
  },
];

const overviewItem = adminNavigationItems[0];
const studentsItem = adminNavigationItems[1];
const contentItem = adminNavigationItems[2];
const reviewsItem = adminNavigationItems[3];
const reportsItem = adminNavigationItems[4];
const settingsItem = adminNavigationItems[5];
const auditLogsItem = adminNavigationItems[6];
const roleMenuItem = adminNavigationItems[7];

export const roleBasedMenuGroups: readonly RoleBasedMenuGroup[] = [
  {
    role: 'pilot_admin',
    items: [
      overviewItem,
      studentsItem,
      contentItem,
      reviewsItem,
      reportsItem,
      auditLogsItem,
      settingsItem,
      roleMenuItem,
    ],
  },
  {
    role: 'content_manager',
    items: [overviewItem, contentItem, reportsItem],
  },
  {
    role: 'human_reviewer',
    items: [overviewItem, reviewsItem, reportsItem],
  },
  {
    role: 'project_owner',
    items: [overviewItem, reportsItem, auditLogsItem, settingsItem, roleMenuItem],
  },
];
