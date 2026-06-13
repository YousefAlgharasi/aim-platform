// Phase 2 — P2-061
// Admin user detail DTO.
//
// Security rules:
// - supabase_auth_uid is never returned to the client.
// - Only safe, admin-approved fields are exposed.
// - Backend is the final authority for identity, roles, and ownership.

import { ApiProperty } from '@nestjs/swagger';
import { UserStatus, UserType } from '../../users/users.types';

export class AdminStudentProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  displayName!: string | null;

  @ApiProperty({ nullable: true })
  nativeLanguage!: string | null;

  @ApiProperty({ nullable: true })
  targetLanguage!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class AdminAdminProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  displayName!: string | null;

  @ApiProperty({ nullable: true })
  department!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class AdminUserDetailDto {
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

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ type: AdminStudentProfileDto, nullable: true })
  studentProfile!: AdminStudentProfileDto | null;

  @ApiProperty({ type: AdminAdminProfileDto, nullable: true })
  adminProfile!: AdminAdminProfileDto | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
