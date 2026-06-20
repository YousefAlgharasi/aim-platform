// P12-017: Create Parent DTOs and Entities
// Read-only parent-facing report entity. `summary` and `reportType` are
// backend-prepared text only; no score, correctness, or recommendation is
// computed in the parent dashboard layer.

import { ApiProperty } from '@nestjs/swagger';

export class ParentChildReportEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  parentId!: string;

  @ApiProperty()
  childId!: string;

  @ApiProperty()
  reportType!: string;

  @ApiProperty()
  generatedAt!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ nullable: true })
  dataUrl!: string | null;
}
