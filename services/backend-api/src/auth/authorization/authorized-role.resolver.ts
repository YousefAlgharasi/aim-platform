import { AuthenticatedUser } from '../authenticated-user';
import { AuthorizedRole, isAuthorizedRole } from './authorized-role';

const ROLE_METADATA_KEYS = ['role', 'roles', 'app_role', 'app_roles'] as const;

export function resolveAuthorizedRoles(user: AuthenticatedUser): readonly AuthorizedRole[] {
  const metadataValues = ROLE_METADATA_KEYS.flatMap((key) =>
    readRoleValues(user.appMetadata?.[key]),
  );

  return [...new Set(metadataValues.filter(isAuthorizedRole))];
}

function readRoleValues(value: unknown): readonly unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap(readRoleValues);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((role) => role.trim())
      .filter((role) => role.length > 0);
  }

  return value === undefined || value === null ? [] : [value];
}
