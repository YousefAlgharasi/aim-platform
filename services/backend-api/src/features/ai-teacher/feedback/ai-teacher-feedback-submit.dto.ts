/**
 * P8-077: Add AI Teacher API DTO Validation (Group H — AI Teacher API
 * Endpoints). Request DTO for POST /ai-teacher/messages/:messageId/feedback.
 *
 * `rating` must be exactly 'helpful' or 'not_helpful'. Any other value,
 * or a missing/non-string value, is rejected with a 400 VALIDATION_ERROR
 * before the service is invoked. No mastery/level/weakness/difficulty/
 * recommendation/review-schedule value is involved
 * (docs/phase-8/no-aim-replacement-rule.md).
 *
 * `messageId` is NOT accepted from the request body — it comes from the
 * route param `:messageId` (already enforced by the controller, P8-076).
 * `studentId` is NOT accepted from the request body — it is always
 * resolved from the authenticated JWT.
 */
import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AiTeacherFeedbackRating } from './ai-teacher-feedback-submit.types';

const VALID_RATINGS: readonly string[] = ['helpful', 'not_helpful'];

export class SubmitFeedbackRequestDto {
  readonly rating!: AiTeacherFeedbackRating;

  static fromBody(body: unknown): SubmitFeedbackRequestDto {
    const rating = (body as Record<string, unknown> | null)?.rating;

    if (typeof rating !== 'string' || !VALID_RATINGS.includes(rating)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `rating is required and must be one of: ${VALID_RATINGS.join(', ')}.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return { rating: rating as AiTeacherFeedbackRating };
  }
}
