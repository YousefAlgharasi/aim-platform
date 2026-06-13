// Phase 2 — P2-059
// Admin users service.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - Only admins and super-admins may call these methods (enforced by RoleGuard at controller).
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for identity, roles, permissions, and ownership.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { UserRow } from '../../users/users.types';
import { SafeUserDto } from './safe-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly db: DatabaseService) {}

  async listUsers(): Promise<SafeUserDto[]> {
    const result = await this.db.query<UserRow>(
      `SELECT id, email, phone, user_type, status, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`,
      [],
    );

    return result.rows.map((row) => this.toSafeDto(row));
  }

  private toSafeDto(row: UserRow): SafeUserDto {
    const dto = new SafeUserDto();
    dto.id = row.id;
    dto.email = row.email;
    dto.phone = row.phone;
    dto.userType = row.user_type;
    dto.status = row.status;
    dto.createdAt = row.created_at;
    dto.updatedAt = row.updated_at;
    return dto;
  }
}