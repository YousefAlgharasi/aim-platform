import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubmitPlacementAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  readonly placement_question_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly answer_value!: string;
}
