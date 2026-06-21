// P18-024: Add AI Teacher Validation Rules
// DTOs for the AI Teacher governance domains: prompt template resolution,
// model config selection, safety check recording, and usage/cost events.
// Client requests never carry the resolved template body, provider
// secrets, or quota/cost totals — those are always computed server-side.

import { IsEnum, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class ResolvePromptTemplateDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(20)
  locale!: string;

  @IsString()
  @MaxLength(50)
  audience!: string;
}

export class SelectModelConfigDto {
  @IsIn(['economy', 'standard', 'premium'])
  tier!: 'economy' | 'standard' | 'premium';
}

export class RecordSafetyCheckDto {
  @IsIn(['message', 'voice_segment'])
  targetType!: 'message' | 'voice_segment';

  @IsUUID()
  targetId!: string;

  @IsString()
  @MaxLength(50)
  category!: string;

  @IsIn(['low', 'medium', 'high', 'critical'])
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @IsIn(['allowed', 'flagged', 'blocked'])
  action!: 'allowed' | 'flagged' | 'blocked';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class RecordUsageCostEventDto {
  @IsEnum({ text_generation: 'text_generation', stt: 'stt', tts: 'tts' })
  @IsIn(['text_generation', 'stt', 'tts'])
  eventType!: 'text_generation' | 'stt' | 'tts';

  @IsOptional()
  @IsUUID()
  modelConfigId?: string;

  @IsString()
  @MaxLength(100)
  requestId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tokensUsed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsNumber()
  @Min(0)
  costEstimate!: number;

  @IsIn(['daily', 'monthly'])
  quotaPeriod!: 'daily' | 'monthly';
}

export class CheckQuotaDto {
  @IsIn(['daily', 'monthly'])
  quotaPeriod!: 'daily' | 'monthly';

  @IsNumber()
  @Min(0)
  @Max(100000)
  estimatedCost!: number;
}
