import { AuthorizedRole } from './authorized-role';

export function hasAnyRequiredRole(
  actualRoles: readonly AuthorizedRole[],
  requiredRoles: readonly AuthorizedRole[],
): boolean {
  if (requiredRoles.length === 0) {
    return true;
  }

  const actualRoleSet = new Set(actualRoles);
  return requiredRoles.some((role) => actualRoleSet.has(role));
}
