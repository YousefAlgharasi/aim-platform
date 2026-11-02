import { Type } from 'class-transformer';
import {
  IsBoolean, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateIf,
} from 'class-validator';

const LOCALE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

export class TopicTextDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString() @MaxLength(1000)
  description?: string | null;
}

/** Create/update body. On update every field is optional; `translations` replaces the sent locales. */
export class PracticeTopicDto {
  @IsOptional() @IsIn(['speaking', 'writing'])
  kind?: 'speaking' | 'writing';

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString() @MaxLength(10)
  levelCode?: string | null;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1000)
  xpReward?: number;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number) @IsInt() @Min(30) @Max(7200)
  timeLimitSeconds?: number | null;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number) @IsInt() @Min(1) @Max(1000)
  minWords?: number | null;

  @IsOptional() @IsString() @MaxLength(4000)
  aiPrompt?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  /** { en: {title, description}, ar: {...} } — `en` is required on create. */
  @IsOptional() @IsObject()
  translations?: Record<string, TopicTextDto>;
}

export class StartSpeakingDto {
  @IsUUID()
  topicId!: string;
}

export class SubmitWritingDto {
  @IsUUID()
  topicId!: string;

  @IsString() @IsNotEmpty() @MaxLength(6000)
  text!: string;
}

export function assertLocaleKey(locale: string): boolean {
  return LOCALE.test(locale);
}
