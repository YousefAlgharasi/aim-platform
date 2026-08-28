// Admin assessment write DTOs.
//
// Scope: Metadata and lifecycle only (title/description, course/chapter
// link, timing/attempt settings, status). Grading, scoring, and pass/fail
// remain entirely backend-computed elsewhere and are never accepted here.
// Question attachment/reordering is a separate, not-yet-built feature —
// this DTO does not accept questionIds.

import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAssessmentSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly timeLimitMinutes?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly passMark?: number | null;

  @IsOptional()
  @IsBoolean()
  readonly shuffleQuestions?: boolean;
}

export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  readonly status?: 'draft' | 'published' | 'archived';

  // Which course this assessment is a final exam for. Null clears the link
  // (a standalone assessment, never gated by course completion).
  @IsOptional()
  @IsUUID()
  readonly courseId?: string | null;

  // Which chapter this assessment gates. Null clears the link (not tied to
  // a specific chapter — e.g. a standalone practice quiz).
  @IsOptional()
  @IsUUID()
  readonly chapterId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAssessmentSettingsDto)
  readonly settings?: UpdateAssessmentSettingsDto;
}
