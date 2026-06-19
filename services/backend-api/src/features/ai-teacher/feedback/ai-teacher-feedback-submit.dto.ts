// P8-075: Create AI Teacher Feedback API — request DTO.
//
// messageId is never accepted from the body — it comes from the route
// param only (ai-teacher-feedback-submit.controller.ts). studentId is
// never accepted from the body either — it is always JWT-resolved.

import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AiTeacherFeedbackRating } from './ai-teacher-feedback-submit.types';

const VALID_RATINGS = new Set<string>(['helpful', 'not_helpful']);

export class SubmitTeacherFeedbackRequestDto {
  readonly rating!: AiTeacherFeedbackRating;

  static fromBody(body: unknown): SubmitTeacherFeedbackRequestDto {
    const rating = (body as Record<string, unknown> | null)?.rating;

    if (typeof rating !== 'string' || !VALID_RATINGS.has(rating)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'rating is required and must be "helpful" or "not_helpful".',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return { rating: rating as AiTeacherFeedbackRating };
  }
}
