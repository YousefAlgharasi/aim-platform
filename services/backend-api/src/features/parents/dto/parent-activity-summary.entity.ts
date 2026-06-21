// P12-029: Create Parent Activity Summary Service
// Read-only parent-facing shapes for a child's recent learning activity. Every
// field is a pass-through of values already persisted by the Phase 5 AIM
// pipeline's session summaries — no mastery, score, or behavioral signal is
// computed in the parent dashboard layer.

import { ApiProperty } from '@nestjs/swagger';

export class ParentChildRecentSessionEntity {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  itemsAttempted!: number;

  @ApiProperty()
  itemsCorrect!: number;

  @ApiProperty({ type: [String] })
  skillsTouched!: string[];

  @ApiProperty()
  overallMasteryShift!: string;

  @ApiProperty({ nullable: true })
  closedOutAt!: string | null;

  @ApiProperty()
  updatedAt!: string;
}

export class ParentActivitySummaryEntity {
  @ApiProperty()
  childId!: string;

  @ApiProperty({ type: [ParentChildRecentSessionEntity] })
  recentSessions!: ParentChildRecentSessionEntity[];

  @ApiProperty({ nullable: true })
  lastActiveAt!: string | null;

  @ApiProperty()
  retrievedAt!: string;
}
