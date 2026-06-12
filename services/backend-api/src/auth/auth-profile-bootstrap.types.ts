// Phase 2 — P2-025
// Auth profile bootstrap types.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
//   - supabaseAuthUid must always come from a verified JWT, never from client input.
//   - userType and status are sourced from the database, not from client submissions.
//   - Backend remains the final authority for identity, roles, permissions, and ownership.
//   - No secrets, service-role keys, database credentials, or privileged config are stored here.
//   - No onboarding, placement, lessons, sessions, AIM, AI Teacher, or Student Web App data here.

// Input for bootstrapping a user's internal record + profile on first login.
// All fields must originate from the verified Supabase JWT, not from a client payload.
export interface BootstrapProfileInput {
  // Verified Supabase Auth UID — must be sourced from the verified JWT subject claim.
  readonly supabaseAuthUid: string;
  // Email from the verified JWT payload — may be null if not present.
  readonly email?: string | null;
  // Phone from the verified JWT payload — may be null if not present.
  readonly phone?: string | null;
}

// Result returned after a successful bootstrap.
export interface BootstrapProfileResult {
  // The internal AIM user record, upserted or existing.
  readonly internalUserId: string;
  readonly userType: string;
  readonly status: string;
  // Whether a new internal user row was created (true) or already existed (false).
  readonly userCreated: boolean;
  // Whether a profile row was created (true) or already existed / was skipped (false).
  readonly profileCreated: boolean;
  // The profile type that was ensured: 'student_profile' | 'admin_profile' | null.
  readonly profileType: string | null;
}
