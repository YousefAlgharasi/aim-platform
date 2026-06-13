// Phase 2 — P2-060 / P2-062
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

export type AdminStudentProfile = {
  readonly id: string;
  readonly displayName: string | null;
  readonly nativeLanguage: string | null;
  readonly targetLanguage: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminAdminProfile = {
  readonly id: string;
  readonly displayName: string | null;
  readonly department: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminUserDetail = {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly userType: AdminUserType;
  readonly status: AdminUserStatus;
  readonly roles: string[];
  readonly studentProfile: AdminStudentProfile | null;
  readonly adminProfile: AdminAdminProfile | null;
  readonly createdAt: string;
  readonly updatedAt: string;
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

export async function fetchAdminUserDetail(
  token: string,
  userId: string,
): Promise<AdminUserDetail> {
  const envelope = await adminApiClient.get<AdminUserDetail>(
    `/admin/users/${encodeURIComponent(userId)}`,
    decodeAdminUserDetail,
    { headers: { authorization: `Bearer ${token}` } },
  );

  return envelope.data;
}

function decodeAdminUserDetail(value: unknown): AdminUserDetail {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid admin user detail response.');
  }

  return {
    id: value.id,
    email: typeof value.email === 'string' ? value.email : null,
    phone: typeof value.phone === 'string' ? value.phone : null,
    userType: isAdminUserType(value.userType) ? value.userType : 'student',
    status: isAdminUserStatus(value.status) ? value.status : 'active',
    roles: Array.isArray(value.roles)
      ? value.roles.filter((r): r is string => typeof r === 'string')
      : [],
    studentProfile: isObject(value.studentProfile)
      ? decodeStudentProfile(value.studentProfile)
      : null,
    adminProfile: isObject(value.adminProfile)
      ? decodeAdminProfile(value.adminProfile)
      : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function decodeStudentProfile(value: Record<string, unknown>): AdminStudentProfile {
  return {
    id: typeof value.id === 'string' ? value.id : '',
    displayName: typeof value.displayName === 'string' ? value.displayName : null,
    nativeLanguage: typeof value.nativeLanguage === 'string' ? value.nativeLanguage : null,
    targetLanguage: typeof value.targetLanguage === 'string' ? value.targetLanguage : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function decodeAdminProfile(value: Record<string, unknown>): AdminAdminProfile {
  return {
    id: typeof value.id === 'string' ? value.id : '',
    displayName: typeof value.displayName === 'string' ? value.displayName : null,
    department: typeof value.department === 'string' ? value.department : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
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
