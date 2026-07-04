import { ApiProperty } from '@nestjs/swagger';

export class SkillStateEntryDto {
  @ApiProperty()
  skillId!: string;

  @ApiProperty({ minimum: 0, maximum: 1 })
  masteryScore!: number;

  @ApiProperty({ minimum: 0, maximum: 1 })
  masteryConfidence!: number;

  @ApiProperty({
    enum: ['improving', 'stable', 'declining', 'insufficient_data'],
  })
  masteryTrend!: string;

  @ApiProperty({ nullable: true, minimum: 0, maximum: 1 })
  previousMasteryScore!: number | null;

  @ApiProperty()
  lastAttemptId!: string;

  @ApiProperty({ format: 'date-time' })
  lastEvaluatedAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class StudentSkillStateReadResponseDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty({ type: [SkillStateEntryDto] })
  skillStates!: SkillStateEntryDto[];
}

export class ReviewScheduleEntryDto {
  @ApiProperty()
  scheduleId!: string;

  @ApiProperty()
  skillId!: string;

  @ApiProperty({ format: 'date-time' })
  dueAt!: string;

  @ApiProperty({ minimum: 0 })
  intervalDays!: number;

  @ApiProperty({ minimum: 0 })
  repetitionCount!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  basedOnAttemptId!: string;

  @ApiProperty({ format: 'date-time' })
  scheduledAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class ReviewScheduleReadResponseDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty({ type: [ReviewScheduleEntryDto] })
  reviewSchedules!: ReviewScheduleEntryDto[];
}

export class SessionStateBehavioralSignalDto {
  @ApiProperty()
  frustrationLevel!: string;

  @ApiProperty()
  engagementLevel!: string;

  @ApiProperty({ type: [String] })
  signalBasis!: string[];
}

export class SessionStateReadResponseDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  found!: boolean;

  @ApiProperty({ nullable: true, minimum: 0 })
  itemsAttempted!: number | null;

  @ApiProperty({ nullable: true, minimum: 0 })
  itemsCorrect!: number | null;

  @ApiProperty({ type: [String], nullable: true })
  skillsTouched!: string[] | null;

  @ApiProperty({ nullable: true })
  overallMasteryShift!: string | null;

  @ApiProperty({ type: SessionStateBehavioralSignalDto, nullable: true })
  behavioralSignal!: SessionStateBehavioralSignalDto | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  closedOutAt!: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  updatedAt!: string | null;
}

export class WeaknessRecordEntryDto {
  @ApiProperty()
  weaknessId!: string;

  @ApiProperty()
  skillId!: string;

  @ApiProperty()
  severity!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [String] })
  triggerAttemptIds!: string[];

  @ApiProperty({ format: 'date-time' })
  detectedAt!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  resolvedAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class WeaknessRecordsReadResponseDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty({ type: [WeaknessRecordEntryDto] })
  weaknessRecords!: WeaknessRecordEntryDto[];
}

export class RecommendationEntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  kind!: string;

  @ApiProperty()
  targetSkillId!: string;

  @ApiProperty({ nullable: true })
  targetLessonId!: string | null;

  @ApiProperty({ minimum: 0 })
  rank!: number;

  @ApiProperty()
  reason!: string;

  @ApiProperty({ nullable: true })
  basedOnWeaknessId!: string | null;

  @ApiProperty({ format: 'date-time' })
  generatedAt!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class RecommendationReadResponseDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty({ type: [RecommendationEntryDto] })
  recommendations!: RecommendationEntryDto[];
}

export class DifficultyDecisionEntryDto {
  @ApiProperty()
  skillId!: string;

  @ApiProperty()
  currentDifficulty!: number;

  @ApiProperty()
  previousDifficulty!: number;

  @ApiProperty()
  rationale!: string;

  @ApiProperty({ type: [String] })
  basedOnAttemptIds!: string[];

  @ApiProperty({ format: 'date-time' })
  decidedAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class DifficultyDecisionReadResponseDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  found!: boolean;

  @ApiProperty({ type: DifficultyDecisionEntryDto, nullable: true })
  difficultyDecision!: DifficultyDecisionEntryDto | null;
}
