// Phase 2 — P2-030
// Student profile feature types.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - StudentProfile is a separate domain object from the user account (users table).
// - user_id is always resolved by the backend from a verified Supabase Auth UID.
//   Clients must not supply user_id as proof of ownership.
// - No onboarding, placement, lessons, sessions, progress, AIM, recommendations,
//   AI Teacher, or Student Web App data is stored or returned here.
// - No secrets, service-role keys, or privileged credentials are stored here.

// Raw database row for the student_profiles table.
export interface StudentProfileRow {
  readonly id: string;
  readonly user_id: string;
  readonly profile_type: 'student_profile';
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly preferred_language: string | null;
  readonly timezone: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

// Domain record returned by the student profile service.
export interface StudentProfileRecord {
  readonly id: string;
  readonly userId: string;
  readonly profileType: 'student_profile';
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly preferredLanguage: string | null;
  readonly timezone: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Input for creating a student profile. user_id must come from the backend,
// never from a client-submitted payload.
export interface CreateStudentProfileInput {
  readonly userId: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly preferredLanguage?: string | null;
  readonly timezone?: string | null;
}

// Input for updating safe, mutable student profile fields.
// user_id and profile_type are not writable after creation.
export interface UpdateStudentProfileInput {
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly preferredLanguage?: string | null;
  readonly timezone?: string | null;
}
