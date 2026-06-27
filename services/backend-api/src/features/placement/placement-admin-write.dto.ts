// P19-004 — DTOs for admin placement write endpoints.
//
// Scope: Admin CRUD for placement tests, sections, questions, and skill links.
//
// Security rules:
// - These DTOs are the only client-writable shape for admin placement mutations.
// - Backend-controlled fields (status, total_sections, total_questions, version,
//   published_at, timestamps) are never accepted from clients.
// - correct_answer is admin-writable (admins manage the answer key) but is never
//   returned to students.

import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePlacementTestDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  readonly estimated_minutes?: number;
}

export class UpdatePlacementTestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly title?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  readonly estimated_minutes?: number;
}

const SKILL_CODES = ['grammar', 'vocabulary', 'reading', 'listening'] as const;

export class CreatePlacementSectionDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsIn(SKILL_CODES)
  readonly skill_code!: string;

  @IsInt()
  @Min(1)
  readonly order_index!: number;
}

export class UpdatePlacementSectionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly title?: string;

  @IsIn(SKILL_CODES)
  @IsOptional()
  readonly skill_code?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  readonly order_index?: number;
}

const QUESTION_TYPES = [
  'multiple_choice',
  'true_false',
  'fill_blank',
  'listening_choice',
] as const;

export class CreatePlacementQuestionDto {
  @IsIn(QUESTION_TYPES)
  readonly question_type!: string;

  @IsString()
  @IsNotEmpty()
  readonly prompt!: string;

  @IsString()
  @IsOptional()
  readonly media_url?: string;

  @IsInt()
  @Min(1)
  readonly order_index!: number;

  @IsString()
  @IsNotEmpty()
  readonly correct_answer!: string;
}

export class UpdatePlacementQuestionDto {
  @IsIn(QUESTION_TYPES)
  @IsOptional()
  readonly question_type?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly prompt?: string;

  @IsString()
  @IsOptional()
  readonly media_url?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  readonly order_index?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly correct_answer?: string;
}

export class AddPlacementQuestionSkillDto {
  @IsUUID()
  readonly skill_id!: string;

  @IsBoolean()
  @IsOptional()
  readonly is_primary?: boolean;
}
