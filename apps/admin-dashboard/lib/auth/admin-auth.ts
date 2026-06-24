import { cookies } from 'next/headers';

import {
  AdminApiClientError,
  adminApiClient,
} from '../api';

export const ADMIN_AUTH_TOKEN_COOKIE = 'aim_admin_access_token';

export type BackendAuthorizedRole =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'content_editor'
  | 'reviewer'
  | 'admin'
  | 'super_admin';

export type AdminAuthUser = {
  readonly id: string;
  readonly email?: string;
};

export type AdminAuthContext = {
  readonly user: AdminAuthUser;
  readonly roles: readonly BackendAuthorizedRole[];
  readonly permissions: readonly string[];
  readonly expiresAt: number;
};

export type AdminAuthState =
  | {
      readonly status: 'authenticated';
      readonly context: AdminAuthContext;
    }
  | {
      readonly status: 'unauthenticated';
    }
  | {
      readonly status: 'unauthorized';
      readonly roles: readonly BackendAuthorizedRole[];
    }
  | {
      readonly status: 'unavailable';
    };

const ADMIN_DASHBOARD_ALLOWED_ROLES: readonly BackendAuthorizedRole[] = [
  'admin',
  'super_admin',
];

export async function getAdminAuthState(): Promise<AdminAuthState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim();

  if (!token) {
    return { status: 'unauthenticated' };
  }

  try {
    const envelope = await adminApiClient.get<AdminAuthContext>(
      '/auth/me',
      decodeAdminAuthContext,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );

    if (!hasAdminDashboardAccess(envelope.data.roles)) {
      return {
        status: 'unauthorized',
        roles: envelope.data.roles,
      };
    }

    return {
      status: 'authenticated',
      context: envelope.data,
    };
  } catch (error) {
    if (error instanceof AdminApiClientError && error.status === 401) {
      return { status: 'unauthenticated' };
    }

    return { status: 'unavailable' };
  }
}

export function hasAdminDashboardAccess(
  roles: readonly BackendAuthorizedRole[],
): boolean {
  return roles.some((role) => ADMIN_DASHBOARD_ALLOWED_ROLES.includes(role));
}

function decodeAdminAuthContext(value: unknown): AdminAuthContext {
  if (!isObject(value)) {
    throw new Error('Invalid auth context response.');
  }

  const user = decodeUser(value.user);
  const session = decodeSession(value.session);
  const roles = decodeRoles(value.roles);
  const permissions = decodeStringArray(value.permissions);

  return {
    user,
    roles,
    permissions,
    expiresAt: session.expiresAt,
  };
}

function decodeUser(value: unknown): AdminAuthUser {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid auth user response.');
  }

  return {
    id: value.id,
    ...(typeof value.email === 'string' ? { email: value.email } : {}),
  };
}

function decodeSession(value: unknown): { readonly expiresAt: number } {
  if (!isObject(value) || typeof value.expiresAt !== 'number') {
    throw new Error('Invalid auth session response.');
  }

  return {
    expiresAt: value.expiresAt,
  };
}

function decodeRoles(value: unknown): readonly BackendAuthorizedRole[] {
  return decodeStringArray(value).filter(isBackendAuthorizedRole);
}

function decodeStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function isBackendAuthorizedRole(value: string): value is BackendAuthorizedRole {
  return [
    'student',
    'parent',
    'teacher',
    'content_editor',
    'admin',
    'super_admin',
  ].includes(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
