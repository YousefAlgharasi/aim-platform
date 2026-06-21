// P11-013: DTO for updating user status. Admin and Super Admin only.
// Backend is final authority — client may only submit the new status value.
// supabase_auth_uid is never accepted from the client.

import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UserStatus } from '../../users/users.types';

const ALLOWED_STATUSES: readonly UserStatus[] = ['active', 'disabled'];

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New user status. Only active or disabled are permitted from admin.',
    enum: ALLOWED_STATUSES,
  })
  @IsIn(ALLOWED_STATUSES)
  status!: UserStatus;
}
