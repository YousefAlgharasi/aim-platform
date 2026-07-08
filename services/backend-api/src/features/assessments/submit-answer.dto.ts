// Request body for POST /student/assessments/attempts/:attemptId/answers.
// Only an opaque student selection is ever accepted here — no isCorrect,
// score, or correctAnswer field exists on this DTO, so a client cannot
// inject a grading outcome even if it tried.

import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  assessmentQuestionLinkId!: string;

  /** Opaque student selection (e.g. an option id or free-text value). */
  @IsString()
  @IsNotEmpty()
  responseValue!: string;
}
