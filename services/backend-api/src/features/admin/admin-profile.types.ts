// Phase 2 — P2-031
// Admin profile feature types.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - AdminProfile is a separate domain object from the user account (users table)
//   and from student profiles.
// - Admin profile existence does NOT grant admin authority.
//   Admin access comes from backend-approved role and permission checks only.
// - user_id is always resolved by the backend from a verified internal user record.
//   Clients must not supply user_id as proof of ownership or admin access.
// - No onboarding, placement, lessons, sessions, progress, AIM, recommendations,
//   AI Teacher, or Student Web App data is stored or returned here.
// - No secrets, service-role keys, or privileged credentials are stored here.

// Raw database row for the admin_profiles table.
export interface AdminProfileRow {
  readonly id: string;
  readonly user_id: string;
  readonly profile_type: 'admin_profile';
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly department: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

// Domain record returned by the admin profile service.
export interface AdminProfileRecord {
  readonly id: string;
  readonly userId: string;
  readonly profileType: 'admin_profile';
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly department: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Input for creating an admin profile.
// userId must come from the backend (verified JWT + internal user lookup),
// never from a client-submitted payload.
export interface CreateAdminProfileInput {
  readonly userId: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly department?: string | null;
}

// Input for updating safe, mutable admin profile fields.
// userId and profileType are immutable after creation.
export interface UpdateAdminProfileInput {
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly department?: string | null;
}
