export const CurriculumPermission = {
  READ: 'curriculum.read',
  WRITE: 'curriculum.write',
  REVIEW: 'curriculum.review',
  PUBLISH: 'curriculum.publish',
  ARCHIVE: 'curriculum.archive',
  AUDIT_READ: 'curriculum.audit.read',
} as const;

export type CurriculumPermissionValue =
  (typeof CurriculumPermission)[keyof typeof CurriculumPermission];
