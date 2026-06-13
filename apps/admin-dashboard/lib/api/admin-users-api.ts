// Phase 2 — P2-060
// Admin users API client.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie.
// - supabaseAuthUid is never present in the response (stripped by backend).
// - Admin dashboard is UX only — backend remains the authorization authority.

import { adminApiClient } from './index';

export type AdminUserStatus = 'active' | 'pending' | 'disabled' | 'deleted';
export type AdminUserType = 'student' | 'admin' | 'reviewer' | 'support' | 'system';

export type AdminUserListItem = {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly userType: AdminUserType;
  readonly status: AdminUserStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminUserListData = {
  readonly users: AdminUserListItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export async function fetchAdminUsers(
  token: string,
  page: number,
  limit: number,
): Promise<AdminUserListData> {
  const envelope = await adminApiClient.get<AdminUserListData>(
    '/admin/users',
    decodeAdminUserListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { page, limit },
    },
  );

  return envelope.data;
}

function decodeAdminUserListData(value: unknown): AdminUserListData {
  if (!isObject(value)) {
    throw new Error('Invalid admin users list response.');
  }

  const users = Array.isArray(value.users)
    ? value.users.map(decodeAdminUserListItem)
    : [];

  return {
    users,
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

function decodeAdminUserListItem(value: unknown): AdminUserListItem {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid admin user item in response.');
  }

  return {
    id: value.id,
    email: typeof value.email === 'string' ? value.email : null,
    phone: typeof value.phone === 'string' ? value.phone : null,
    userType: isAdminUserType(value.userType) ? value.userType : 'student',
    status: isAdminUserStatus(value.status) ? value.status : 'active',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function isAdminUserType(value: unknown): value is AdminUserType {
  return (
    typeof value === 'string' &&
    ['student', 'admin', 'reviewer', 'support', 'system'].includes(value)
  );
}

function isAdminUserStatus(value: unknown): value is AdminUserStatus {
  return (
    typeof value === 'string' &&
    ['active', 'pending', 'disabled', 'deleted'].includes(value)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
