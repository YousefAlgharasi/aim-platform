// Phase 2 — P2-059 / P2-061
// Admin feature types.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - supabase_auth_uid is never exposed in admin client responses.
// - Backend is the final authority for authorization and role assignment.
// - Admin clients receive only safe, read-only user fields.

import { UserStatus, UserType } from '../users/users.types';

export interface AdminUserListItem {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly userType: UserType;
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminUserListResponse {
  readonly users: AdminUserListItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

// Safe role summary returned in admin user detail responses.
// Does not include internal role metadata (id, is_system, created_at).
export interface AdminUserRoleItem {
  readonly key: string;
  readonly name: string;
}

// Safe user detail returned to authorized admins.
// supabase_auth_uid is excluded — not needed for admin management UI.
// Permission codes are excluded — admin UI shows roles only in Phase 2.
export interface AdminUserDetailResponse {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly userType: UserType;
  readonly status: UserStatus;
  readonly roles: AdminUserRoleItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
