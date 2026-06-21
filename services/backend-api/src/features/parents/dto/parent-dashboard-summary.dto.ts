// P12-017: Create Parent DTOs and Entities
// Response shape for the parent dashboard home view. Every field is a
// safe, backend-prepared display value — no mastery, weakness, score, or
// recommendation is calculated here. Fields are nullable where consent for
// the underlying scope has not been granted.

import { ApiProperty } from '@nestjs/swagger';

export class ParentDashboardChildSummaryDto {
  @ApiProperty()
  childId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ nullable: true, description: 'Backend-supplied progress label, e.g. "On track".' })
  progressLabel!: string | null;

  @ApiProperty({ nullable: true, description: 'Backend-supplied flag indicating open weaknesses exist.' })
  hasOpenWeaknesses!: boolean | null;

  @ApiProperty({ nullable: true, description: 'Backend-supplied count of upcoming assessment deadlines.' })
  upcomingDeadlineCount!: number | null;

  @ApiProperty()
  lastUpdatedAt!: string;
}

export class ParentDashboardSummaryDto {
  @ApiProperty()
  parentId!: string;

  @ApiProperty({ type: [ParentDashboardChildSummaryDto] })
  children!: ParentDashboardChildSummaryDto[];
}
