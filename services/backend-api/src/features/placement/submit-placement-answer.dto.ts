import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmitPlacementAnswerDto {
  @IsUUID()
  @IsOptional()
  readonly placement_attempt_id?: string;

  @IsUUID()
  @IsNotEmpty()
  readonly placement_question_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly answer_value!: string;
}
