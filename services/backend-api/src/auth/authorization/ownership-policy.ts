import { AuthorizedRole } from './authorized-role';

export interface StudentOwnershipRequirement {
  /**
   * Route parameter containing the target student/user id.
   * Phase 1 keeps ownership checks route-param based to avoid reading raw learner payloads.
   */
  readonly paramName: string;

  /**
   * Roles allowed to bypass direct self-ownership checks.
   * Keep this narrow until database-backed relationship checks exist.
   */
  readonly privilegedRoles: readonly AuthorizedRole[];
}
