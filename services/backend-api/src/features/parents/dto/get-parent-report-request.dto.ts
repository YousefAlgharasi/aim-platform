// P12-036: Create Parent Reports API
// Validates the report period query param for the parent reports endpoint.

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class GetParentReportRequestDto {
  @ApiPropertyOptional({ enum: ['weekly', 'monthly'], default: 'weekly' })
  @IsOptional()
  @IsIn(['weekly', 'monthly'])
  period?: 'weekly' | 'monthly';
}
