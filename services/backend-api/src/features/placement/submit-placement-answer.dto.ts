import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubmitPlacementAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  readonly placementQuestionId!: string;

  @IsString()
  @IsNotEmpty()
  readonly answerValue!: string;
}
