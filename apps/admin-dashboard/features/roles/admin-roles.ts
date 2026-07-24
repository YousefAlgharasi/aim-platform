export type AdminRoleKey =
  | 'pilot_admin'
  | 'content_manager'
  | 'human_reviewer'
  | 'project_owner';

export type AdminRoleDefinition = {
  readonly key: AdminRoleKey;
  readonly label: string;
  readonly description: string;
};

export const adminRoles: readonly AdminRoleDefinition[] = [
  {
    key: 'pilot_admin',
    label: 'Pilot Admin',
    description:
      'Operational pilot administrator placeholder for internal admin surfaces.',
  },
  {
    key: 'content_manager',
    label: 'Content Manager',
    description:
      'Content operations placeholder for course, lesson, and asset surfaces.',
  },
  {
    key: 'human_reviewer',
    label: 'Human Reviewer',
    description:
      'Human review placeholder for disputed grades and review queue surfaces.',
  },
  {
    key: 'project_owner',
    label: 'Project Owner',
    description:
      'Project owner placeholder for reporting, health, and governance surfaces.',
  },
];

export function getAdminRoleLabel(roleKey: AdminRoleKey): string {
  return adminRoles.find((role) => role.key === roleKey)?.label ?? roleKey;
}
