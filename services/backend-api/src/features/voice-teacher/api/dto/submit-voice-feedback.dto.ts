import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export enum VoiceFeedbackRatingDto {
  HELPFUL = 'helpful',
  NOT_HELPFUL = 'not_helpful',
}

export class SubmitVoiceFeedbackDto {
  @IsUUID()
  readonly messageId!: string;

  @IsEnum(VoiceFeedbackRatingDto)
  readonly rating!: VoiceFeedbackRatingDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly comment?: string;
}
