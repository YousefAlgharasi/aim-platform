// Phase 2 — P2-059
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
