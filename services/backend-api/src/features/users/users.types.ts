// Phase 2 — P2-029
// Users feature types.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - Backend is the final authority for user identity, roles, permissions, and ownership.
// - Clients must not submit user IDs, roles, status, or user_type values as authority.
// - No secrets, service-role keys, or privileged credentials are stored here.

export type UserType = 'student' | 'admin' | 'reviewer' | 'support' | 'system';
export type UserStatus = 'active' | 'pending' | 'disabled' | 'deleted';

// Raw database row for the users table.
export interface UserRow {
  readonly id: string;
  readonly supabase_auth_uid: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly user_type: UserType;
  readonly status: UserStatus;
  readonly created_at: string;
  readonly updated_at: string;
}

// Domain record returned by the users service.
export interface UserRecord {
  readonly id: string;
  readonly supabaseAuthUid: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly userType: UserType;
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Input for upserting a user record on first authenticated request.
export interface UpsertUserInput {
  readonly supabaseAuthUid: string;
  readonly email?: string | null;
  readonly phone?: string | null;
}

// Input for updating safe, mutable user fields.
export interface UpdateUserInput {
  readonly email?: string | null;
  readonly phone?: string | null;
}

// Paginated user result returned by UsersService.listAll.
export interface UsersPage {
  readonly users: UserRecord[];
  readonly total: number;
}
