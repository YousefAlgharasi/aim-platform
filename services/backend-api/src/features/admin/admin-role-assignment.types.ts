import { RoleRecord } from '../roles';

export interface AssignAdminUserRoleInput {
  readonly actorSupabaseAuthUid: string;
  readonly targetUserId: string;
  readonly roleKey: string;
  readonly reason?: string;
}

export interface AdminRoleAssignmentResponse {
  readonly userId: string;
  readonly role: RoleRecord;
  readonly assignedByUserId: string;
  readonly assignedAt: string;
}
