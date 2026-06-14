// Phase 3 — P3-047
// Shared curriculum content status enum and transition rules.
//
// Source of truth: packages/shared-contracts/api/content-status-contracts.md (P3-015)
//
// Allowed transitions:
//   draft     -> published
//   draft     -> archived
//   published -> archived
//   archived  -> draft   (SUPER_ADMIN only, exceptional — role check is the
//                          caller's responsibility, not this module's)
//
// Forbidden transitions:
//   published -> draft   (must go through archived first)
//   archived  -> published (must go through draft first)
//
// `status` is never client-writable on create/update payloads — see
// `rejectClientWritableStatus` in `validation-helpers.ts`. This module is
// used by the (separate, later) publish/archive workflow endpoints to
// validate the requested transition itself.

export const CURRICULUM_CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;

export type CurriculumContentStatus = (typeof CURRICULUM_CONTENT_STATUSES)[number];

export function isCurriculumContentStatus(value: unknown): value is CurriculumContentStatus {
  return (
    typeof value === 'string' &&
    (CURRICULUM_CONTENT_STATUSES as readonly string[]).includes(value)
  );
}

const ALLOWED_TRANSITIONS: Readonly<Record<CurriculumContentStatus, readonly CurriculumContentStatus[]>> = {
  draft: ['published', 'archived'],
  published: ['archived'],
  archived: ['draft'],
};

/**
 * Returns true if a transition from `from` to `to` is allowed by the Phase 3
 * content status lifecycle (P3-015). Does not perform any role check —
 * the archived -> draft (restore) transition is SUPER_ADMIN-only and must be
 * authorized separately by the caller using Phase 2 role guards.
 */
export function isAllowedStatusTransition(
  from: CurriculumContentStatus,
  to: CurriculumContentStatus,
): boolean {
  if (from === to) {
    return false;
  }

  return ALLOWED_TRANSITIONS[from].includes(to);
}
