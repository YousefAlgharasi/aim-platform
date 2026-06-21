// P11-018: Admin roles and permissions API client.
// Backend is final authority for role/permission data.

import { adminApiClient } from './index';

export type AdminRole = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminPermission = {
  readonly id: string;
  readonly key: string;
  readonly scope: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminRoleWithPermissions = {
  readonly role: AdminRole;
  readonly permissions: AdminPermission[];
};

export async function fetchAdminRoles(
  token: string,
): Promise<{ roles: AdminRole[] }> {
  const envelope = await adminApiClient.get<{ roles: AdminRole[] }>(
    '/admin/roles',
    decodeRolesListData,
    { headers: { authorization: `Bearer ${token}` } },
  );

  return envelope.data;
}

export async function fetchAdminRoleDetail(
  token: string,
  roleKey: string,
): Promise<AdminRoleWithPermissions> {
  const envelope = await adminApiClient.get<AdminRoleWithPermissions>(
    `/admin/roles/${encodeURIComponent(roleKey)}`,
    decodeRoleWithPermissions,
    { headers: { authorization: `Bearer ${token}` } },
  );

  return envelope.data;
}

function decodeRolesListData(value: unknown): { roles: AdminRole[] } {
  if (!isObject(value)) {
    throw new Error('Invalid roles list response.');
  }

  const roles = Array.isArray(value.roles)
    ? value.roles.map(decodeRole)
    : [];

  return { roles };
}

function decodeRoleWithPermissions(value: unknown): AdminRoleWithPermissions {
  if (!isObject(value)) {
    throw new Error('Invalid role detail response.');
  }

  return {
    role: decodeRole(value.role),
    permissions: Array.isArray(value.permissions)
      ? value.permissions.map(decodePermission)
      : [],
  };
}

function decodeRole(value: unknown): AdminRole {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid role record.');
  }

  return {
    id: value.id,
    key: typeof value.key === 'string' ? value.key : '',
    name: typeof value.name === 'string' ? value.name : '',
    description: typeof value.description === 'string' ? value.description : null,
    isSystem: typeof value.isSystem === 'boolean' ? value.isSystem : false,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function decodePermission(value: unknown): AdminPermission {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid permission record.');
  }

  return {
    id: value.id,
    key: typeof value.key === 'string' ? value.key : '',
    scope: typeof value.scope === 'string' ? value.scope : '',
    description: typeof value.description === 'string' ? value.description : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
