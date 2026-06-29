import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// placement_question_id (and placement_attempt_id, if ever supplied) are
// validated as plain non-empty strings rather than strict RFC4122 UUIDs:
// seeded placement_questions.id values are not version/variant-compliant
// UUIDs, and existence + ownership are already enforced by the DB lookup
// in PlacementAnswerSubmitService, so strict UUID-format checking here
// only rejects legitimate IDs without adding any real validation.
export class SubmitPlacementAnswerDto {
  @IsString()
  @IsOptional()
  readonly placement_attempt_id?: string;

  @IsString()
  @IsNotEmpty()
  readonly placement_question_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly answer_value!: string;
}
