import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';

export const CurriculumPermission = {
  CONTENT_READ_PUBLISHED: 'curriculum.content.read.published',
  CONTENT_READ_DRAFT: 'curriculum.content.read.draft',
  CONTENT_READ_ARCHIVED: 'curriculum.content.read.archived',
  CONTENT_CREATE: 'curriculum.content.create',
  CONTENT_UPDATE: 'curriculum.content.update',
  CONTENT_PUBLISH: 'curriculum.content.publish',
  CONTENT_ARCHIVE: 'curriculum.content.archive',
  CONTENT_RESTORE: 'curriculum.content.restore',
  SKILL_LINKS_MANAGE: 'curriculum.skill_links.manage',
  AUDIT_READ: 'curriculum.audit.read',
} as const;

export type CurriculumPermissionKey =
  (typeof CurriculumPermission)[keyof typeof CurriculumPermission];

export const CURRICULUM_WRITE_ROLES: readonly AuthorizedRole[] = [
  AuthorizedRole.ADMIN,
  AuthorizedRole.SUPER_ADMIN,
];

export const CURRICULUM_READ_ADMIN_ROLES: readonly AuthorizedRole[] = [
  AuthorizedRole.ADMIN,
  AuthorizedRole.SUPER_ADMIN,
  AuthorizedRole.REVIEWER,
];

export const CURRICULUM_RESTORE_ROLES: readonly AuthorizedRole[] = [
  AuthorizedRole.SUPER_ADMIN,
];

export const RequireCurriculumWrite = (): MethodDecorator & ClassDecorator =>
  RequireRoles(...CURRICULUM_WRITE_ROLES);

export const RequireCurriculumAdminRead = (): MethodDecorator & ClassDecorator =>
  RequireRoles(...CURRICULUM_READ_ADMIN_ROLES);

export const RequireCurriculumRestore = (): MethodDecorator & ClassDecorator =>
  RequireRoles(...CURRICULUM_RESTORE_ROLES);
