// P12-028: Create Parent Assessment Summary Service
// Read-only parent-facing shapes for a child's assessment results and
// upcoming assessment deadlines. Every field is a pass-through of values
// already computed and persisted by the Phase 10 assessment pipeline — no
// score, pass/fail, deadline status, or correctness is computed here.

import { ApiProperty } from '@nestjs/swagger';

export class ParentAssessmentResultEntity {
  @ApiProperty()
  resultId!: string;

  @ApiProperty()
  attemptId!: string;

  @ApiProperty()
  assessmentId!: string;

  @ApiProperty()
  assessmentTitle!: string;

  @ApiProperty()
  attemptNumber!: number;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  maxScore!: number;

  @ApiProperty()
  passed!: boolean;

  @ApiProperty()
  latePenaltyApplied!: boolean;

  @ApiProperty()
  gradedAt!: string;

  @ApiProperty({ nullable: true })
  submittedAt!: string | null;
}

export class ParentAssessmentUpcomingEntity {
  @ApiProperty()
  assessmentId!: string;

  @ApiProperty()
  assessmentTitle!: string;

  @ApiProperty()
  deadlineId!: string;

  @ApiProperty()
  opensAt!: string;

  @ApiProperty()
  closesAt!: string;

  @ApiProperty({ nullable: true })
  extendedClosesAt!: string | null;

  @ApiProperty()
  status!: string;
}

export class ParentAssessmentSummaryEntity {
  @ApiProperty()
  childId!: string;

  @ApiProperty({ type: [ParentAssessmentResultEntity] })
  results!: ParentAssessmentResultEntity[];

  @ApiProperty({ type: [ParentAssessmentUpcomingEntity] })
  upcomingAssessments!: ParentAssessmentUpcomingEntity[];

  @ApiProperty()
  retrievedAt!: string;
}
