// P11-013: Query DTO for admin users list with search and filter support.
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, UserType } from '../../users/users.types';

export class AdminUsersListQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page (max 100)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by user status' })
  @IsOptional()
  @IsIn(['active', 'pending', 'disabled', 'deleted'] satisfies UserStatus[])
  status?: UserStatus;

  @ApiPropertyOptional({ description: 'Filter by user type' })
  @IsOptional()
  @IsIn(['student', 'admin', 'reviewer', 'support', 'system'] satisfies UserType[])
  userType?: UserType;

  @ApiPropertyOptional({ description: 'Search by email (partial match, case-insensitive)' })
  @IsOptional()
  @IsString()
  email?: string;
}
