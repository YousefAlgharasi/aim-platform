// Phase 2 — P2-060 / P2-062 / P2-063
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
  // Backend-computed lesson progress — null for non-student users.
  readonly completedLessons: number | null;
  readonly totalLessons: number | null;
  readonly completionPct: number | null;
  readonly lastActiveAt: string | null;
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

export type FetchAdminUsersOptions = {
  readonly token: string;
  readonly page: number;
  readonly limit: number;
  readonly status?: AdminUserStatus;
  readonly userType?: AdminUserType;
  readonly email?: string;
};

export async function fetchAdminUsers(
  tokenOrOptions: string | FetchAdminUsersOptions,
  page?: number,
  limit?: number,
): Promise<AdminUserListData> {
  const opts: FetchAdminUsersOptions =
    typeof tokenOrOptions === 'string'
      ? { token: tokenOrOptions, page: page ?? 1, limit: limit ?? 20 }
      : tokenOrOptions;

  const envelope = await adminApiClient.get<AdminUserListData>(
    '/admin/users',
    decodeAdminUserListData,
    {
      headers: { authorization: `Bearer ${opts.token}` },
      query: {
        page: opts.page,
        limit: opts.limit,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.userType ? { userType: opts.userType } : {}),
        ...(opts.email ? { email: opts.email } : {}),
      },
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
    completedLessons: typeof value.completedLessons === 'number' ? value.completedLessons : null,
    totalLessons: typeof value.totalLessons === 'number' ? value.totalLessons : null,
    completionPct: typeof value.completionPct === 'number' ? value.completionPct : null,
    lastActiveAt: typeof value.lastActiveAt === 'string' ? value.lastActiveAt : null,
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

// ---------------------------------------------------------------------------
// Role assignment (P2-063 / P2-064)
// ---------------------------------------------------------------------------

// Safe role summary returned inside the role-assignment response.
export type AdminRoleAssignedRole = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
};

// Matches the backend AdminRoleAssignmentResponse envelope data.
// Backend shape: { userId, role: RoleRecord, assignedByUserId, assignedAt }
// The outer success/data/meta envelope is handled by adminApiClient.
export type AdminRoleChangeResult = {
  readonly userId: string;
  readonly role: AdminRoleAssignedRole;
  readonly assignedByUserId: string;
  readonly assignedAt: string;
};

/**
 * PUT /admin/users/:userId/roles
 *
 * Calls the backend to assign or change a user's role.
 * Backend enforces admin/super_admin authorization — this client is UX only.
 * Token must be the caller's bearer token from the HTTP-only cookie.
 *
 * The backend audit-logs every role change via AuthLoggingService (P2-040).
 */
export async function changeAdminUserRole(
  token: string,
  userId: string,
  roleKey: string,
  reason?: string,
): Promise<AdminRoleChangeResult> {
  const envelope = await adminApiClient.put<AdminRoleChangeResult>(
    `/admin/users/${encodeURIComponent(userId)}/roles`,
    decodeRoleChangeResult,
    {
      headers: { authorization: `Bearer ${token}` },
      body: { roleKey, ...(reason ? { reason } : {}) },
    },
  );

  return envelope.data;
}

// ---------------------------------------------------------------------------
// Status update (P11-017)
// ---------------------------------------------------------------------------

export type AdminUserStatusUpdateResult = {
  readonly id: string;
  readonly email: string | null;
  readonly userType: AdminUserType;
  readonly status: AdminUserStatus;
  readonly updatedAt: string;
};

export async function updateAdminUserStatus(
  token: string,
  userId: string,
  status: 'active' | 'disabled',
): Promise<AdminUserStatusUpdateResult> {
  const envelope = await adminApiClient.patch<AdminUserStatusUpdateResult>(
    `/admin/users/${encodeURIComponent(userId)}/status`,
    decodeUserStatusUpdateResult,
    {
      headers: { authorization: `Bearer ${token}` },
      body: { status },
    },
  );

  return envelope.data;
}

function decodeUserStatusUpdateResult(value: unknown): AdminUserStatusUpdateResult {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid status update response.');
  }

  return {
    id: value.id,
    email: typeof value.email === 'string' ? value.email : null,
    userType: isAdminUserType(value.userType) ? value.userType : 'student',
    status: isAdminUserStatus(value.status) ? value.status : 'active',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function decodeRoleChangeResult(value: unknown): AdminRoleChangeResult {
  if (!isObject(value) || typeof value.userId !== 'string') {
    throw new Error('Invalid role change response.');
  }

  const role = isObject(value.role) ? value.role : {};

  return {
    userId: value.userId,
    role: {
      id: typeof role.id === 'string' ? role.id : '',
      key: typeof role.key === 'string' ? role.key : '',
      name: typeof role.name === 'string' ? role.name : '',
    },
    assignedByUserId:
      typeof value.assignedByUserId === 'string' ? value.assignedByUserId : '',
    assignedAt:
      typeof value.assignedAt === 'string' ? value.assignedAt : '',
  };
}
