// Phase 4 — P4-051
// Placement permission constants.
//
// Scope: Placement Test system only.
//
// These constants are used with the existing RequirePermissions and RequireRoles
// decorators from the Phase 2 authorization infrastructure (P2-037, P2-038).
//
// Security rules:
// - Permission strings follow the format: placement:<resource>:<action>
// - All placement student endpoints require authentication via SupabaseJwtAuthGuard.
// - All placement admin endpoints require both authentication and admin role.
// - Backend is the sole authority for placement scoring and result generation.
// - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard permissions here.
// - No secrets, service-role keys, database credentials, or privileged config here.

// ---------------------------------------------------------------------------
// Student placement permissions
// ---------------------------------------------------------------------------

/** Student may fetch questions for an active placement section. */
export const PLACEMENT_QUESTIONS_READ = 'placement:questions:read';

/** Student may start a placement attempt. */
export const PLACEMENT_ATTEMPT_START = 'placement:attempt:start';

/** Student may submit an answer during an active placement attempt. */
export const PLACEMENT_ANSWER_SUBMIT = 'placement:answer:submit';

/** Student may complete (submit) a placement attempt. */
export const PLACEMENT_ATTEMPT_COMPLETE = 'placement:attempt:complete';

/** Student may read their own placement result after completion. */
export const PLACEMENT_RESULT_READ = 'placement:result:read';

/** Student may read their own initial learning path after placement. */
export const PLACEMENT_PATH_READ = 'placement:path:read';

// ---------------------------------------------------------------------------
// Admin placement permissions
// ---------------------------------------------------------------------------

/** Admin may list all placement tests. */
export const PLACEMENT_ADMIN_TESTS_READ = 'placement:admin:tests:read';

/** Admin may create a placement test. */
export const PLACEMENT_ADMIN_TEST_CREATE = 'placement:admin:test:create';

/** Admin may update placement test metadata. */
export const PLACEMENT_ADMIN_TEST_UPDATE = 'placement:admin:test:update';

/** Admin may publish or unpublish a placement test. */
export const PLACEMENT_ADMIN_TEST_PUBLISH = 'placement:admin:test:publish';

/** Admin may manage placement sections (create, update, reorder). */
export const PLACEMENT_ADMIN_SECTIONS_MANAGE = 'placement:admin:sections:manage';

/** Admin may manage placement questions (create, update). */
export const PLACEMENT_ADMIN_QUESTIONS_MANAGE = 'placement:admin:questions:manage';

/** Admin may manage skill links for placement questions. */
export const PLACEMENT_ADMIN_SKILL_LINKS_MANAGE = 'placement:admin:skill-links:manage';

/** Admin may view all student placement results. */
export const PLACEMENT_ADMIN_RESULTS_READ = 'placement:admin:results:read';

// ---------------------------------------------------------------------------
// Permission groups — for registering in the roles/permissions seed
// ---------------------------------------------------------------------------

/** All student-facing placement permissions. */
export const STUDENT_PLACEMENT_PERMISSIONS = [
  PLACEMENT_QUESTIONS_READ,
  PLACEMENT_ATTEMPT_START,
  PLACEMENT_ANSWER_SUBMIT,
  PLACEMENT_ATTEMPT_COMPLETE,
  PLACEMENT_RESULT_READ,
  PLACEMENT_PATH_READ,
] as const;

/** All admin-facing placement permissions. */
export const ADMIN_PLACEMENT_PERMISSIONS = [
  PLACEMENT_ADMIN_TESTS_READ,
  PLACEMENT_ADMIN_TEST_CREATE,
  PLACEMENT_ADMIN_TEST_UPDATE,
  PLACEMENT_ADMIN_TEST_PUBLISH,
  PLACEMENT_ADMIN_SECTIONS_MANAGE,
  PLACEMENT_ADMIN_QUESTIONS_MANAGE,
  PLACEMENT_ADMIN_SKILL_LINKS_MANAGE,
  PLACEMENT_ADMIN_RESULTS_READ,
] as const;

/** All placement permissions combined. */
export const ALL_PLACEMENT_PERMISSIONS = [
  ...STUDENT_PLACEMENT_PERMISSIONS,
  ...ADMIN_PLACEMENT_PERMISSIONS,
] as const;

export type PlacementPermission = (typeof ALL_PLACEMENT_PERMISSIONS)[number];
