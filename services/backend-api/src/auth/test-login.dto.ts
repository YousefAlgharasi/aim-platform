import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const TEST_LOGIN_ROLES = ['student', 'admin', 'parent'] as const;

export type TestLoginRole = (typeof TEST_LOGIN_ROLES)[number];

export class TestLoginDto {
  @ApiProperty({ enum: TEST_LOGIN_ROLES })
  @IsIn(TEST_LOGIN_ROLES)
  role!: TestLoginRole;
}
