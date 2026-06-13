// Phase 2 — P2-032
// Profile feature types.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - user_id is always resolved from the verified JWT via UsersService — never from client input.
// - supabase_auth_uid and role fields are not returned to clients by profile endpoints.
// - display_name, avatar_url, preferred_language, timezone, department are safe for clients.
// - Backend is the final authority for identity, roles, permissions, and ownership.
// - Admin profile existence does NOT grant admin authority.
// - No onboarding, placement, lessons, sessions, AIM, AI Teacher, or Student Web App data here.
// - No secrets, service-role keys, database credentials, or privileged config here.

// ---------------------------------------------------------------------------
// Student profile
// ---------------------------------------------------------------------------

// Raw database row for student_profiles.
export interface StudentProfileRow {
  readonly id: string;
  readonly user_id: string;
  readonly profile_type: string;
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly preferred_language: string | null;
  readonly timezone: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

// Domain record used internally.
export interface StudentProfileRecord {
  readonly id: string;
  readonly userId: string;
  readonly profileType: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly preferredLanguage: string | null;
  readonly timezone: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Input for updating safe student profile fields.
// user_id and profile_type are not updatable through this input.
export interface UpdateStudentProfileInput {
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly preferredLanguage?: string | null;
  readonly timezone?: string | null;
}

// ---------------------------------------------------------------------------
// Admin profile
// ---------------------------------------------------------------------------

// Raw database row for admin_profiles.
export interface AdminProfileRow {
  readonly id: string;
  readonly user_id: string;
  readonly profile_type: string;
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly department: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

// Domain record used internally.
export interface AdminProfileRecord {
  readonly id: string;
  readonly userId: string;
  readonly profileType: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly department: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Input for updating safe admin profile fields.
// user_id and profile_type are not updatable through this input.
export interface UpdateAdminProfileInput {
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly department?: string | null;
}

// ---------------------------------------------------------------------------
// Profile endpoint response shapes
// ---------------------------------------------------------------------------

// Safe student profile fields returned to Flutter clients.
// Defined by P2-011 safe-auth-fields.md.
export interface StudentProfileResponse {
  readonly id: string;
  readonly profileType: 'student_profile';
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly preferredLanguage: string | null;
  readonly timezone: string | null;
}

// Safe admin profile fields returned to Admin Dashboard.
// Defined by P2-011 safe-auth-fields.md.
export interface AdminProfileResponse {
  readonly id: string;
  readonly profileType: 'admin_profile';
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly department: string | null;
}

// Unified /profile/me response. Exactly one profile field is populated
// based on the authenticated user's user_type.
export interface ProfileMeResponse {
  readonly internalUserId: string;
  readonly userType: string;
  readonly studentProfile: StudentProfileResponse | null;
  readonly adminProfile: AdminProfileResponse | null;
}

// Allowed update fields submitted to PATCH /profile/me.
// Backend ignores any other fields.
// user_id, profile_type, roles, and permissions cannot be set here.
export interface UpdateProfileMeInput {
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly preferredLanguage?: string | null;  // student only
  readonly timezone?: string | null;           // student only
  readonly department?: string | null;         // admin only
}
