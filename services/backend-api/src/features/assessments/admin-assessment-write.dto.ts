// Admin assessment write DTOs.
//
// Scope: Metadata and lifecycle only (title/description, course/chapter
// link, timing/attempt settings, status, and question attachment/ordering
// via questionIds). Grading, scoring, points, and pass/fail remain entirely
// backend-computed/owned elsewhere and are never accepted here — questionIds
// only carries which questions are attached and in what order; per-question
// points stay at their table default and are never client-supplied.

import { ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsIn(['quiz', 'exam'])
  readonly type!: 'quiz' | 'exam';

  // Accepted but ignored at creation time -- question attachment happens
  // via PATCH /admin/assessments/:id (questionIds) once the assessment
  // exists, same as the create-then-link pattern used for course/chapter.
  @IsOptional()
  @IsArray()
  readonly questionIds?: string[];
}

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

  // Full replacement list of attached question IDs, in display order.
  // Undefined leaves existing attachments untouched; [] detaches all.
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  readonly questionIds?: string[];
}
