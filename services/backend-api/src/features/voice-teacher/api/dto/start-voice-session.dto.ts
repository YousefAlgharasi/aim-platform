import { IsOptional, IsString, MaxLength } from 'class-validator';

export class StartVoiceSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly contextRef?: string;
}
