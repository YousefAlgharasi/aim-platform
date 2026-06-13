// Phase 2 — P2-059
// Admin service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Orchestrate admin-only operations. All data access goes through
//   domain services (UsersService). The admin service is the orchestration
//   layer — it does not own raw database access.
//
// Security rules:
//   - supabase_auth_uid is stripped from all client-facing responses.
//   - Callers must apply RoleGuard (admin/super_admin) before invoking this service.
//   - Backend is the final authority for authorization.

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRecord } from '../users/users.types';
import { AdminUserListItem, AdminUserListResponse } from './admin.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async listUsers(page: number, limit: number): Promise<AdminUserListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const { users, total } = await this.usersService.listAll(offset, safeLimit);

    return {
      users: users.map(toAdminUserListItem),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }
}

function toAdminUserListItem(user: UserRecord): AdminUserListItem {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
