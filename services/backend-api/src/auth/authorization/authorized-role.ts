export enum AuthorizedRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  CONTENT_EDITOR = 'content_editor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export const PRIVILEGED_OWNERSHIP_ROLES: readonly AuthorizedRole[] = [
  AuthorizedRole.ADMIN,
  AuthorizedRole.SUPER_ADMIN,
];

const AUTHORIZED_ROLE_VALUES = new Set<string>(Object.values(AuthorizedRole));

export function isAuthorizedRole(value: unknown): value is AuthorizedRole {
  return typeof value === 'string' && AUTHORIZED_ROLE_VALUES.has(value);
}
