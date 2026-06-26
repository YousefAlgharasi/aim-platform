// Phase 2 — P2-059
// Safe user DTO for admin users list endpoint.
//
// Security rules:
// - Only safe, non-sensitive fields are exposed.
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for identity and roles.

import { ApiProperty } from '@nestjs/swagger';
import { UserStatus, UserType } from '../../users/users.types';

export class SafeUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty()
  userType!: UserType;

  @ApiProperty()
  status!: UserStatus;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true, description: 'Backend-computed lesson completion count. Null for non-student users.' })
  completedLessons!: number | null;

  @ApiProperty({ nullable: true, description: 'Backend-computed count of published lessons. Null for non-student users.' })
  totalLessons!: number | null;

  @ApiProperty({ nullable: true, description: 'Backend-computed completion percent. Null for non-student users.' })
  completionPct!: number | null;

  @ApiProperty({ nullable: true, description: 'Backend-computed last lesson-progress activity timestamp.' })
  lastActiveAt!: string | null;
}