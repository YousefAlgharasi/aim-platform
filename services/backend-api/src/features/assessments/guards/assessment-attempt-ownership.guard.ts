// P10-032: AssessmentAttemptOwnershipGuard.
//
// Scope: Protect attempt-scoped assessment endpoints (e.g. submitting
//        answers, viewing/continuing an attempt). Verifies the authenticated
//        student (from JWT) owns the attempt identified by the `attemptId`
//        route param.
//
// Security rules:
//   - student_id is never trusted from client input — ownership is
//     resolved by looking up the attempt row via AssessmentRepository.
//   - Returns 404 (not 403) when the attempt does not exist or belongs to
//     a different student, to avoid leaking attempt existence.
//   - Computes no score/grading/deadline value — read-only ownership check.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';
import { AssessmentRepository, AssessmentAttemptRow } from '../assessment.repository';

export interface AttemptOwnershipRequest extends AuthenticatedRequest {
  readonly params?: Record<string, string | undefined>;
  /** Attached by this guard so downstream handlers can reuse the loaded attempt. */
  assessmentAttempt?: AssessmentAttemptRow;
}

@Injectable()
export class AssessmentAttemptOwnershipGuard implements CanActivate {
  constructor(private readonly assessmentRepository: AssessmentRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AttemptOwnershipRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const attemptId = request.params?.['attemptId']?.trim();

    if (!attemptId) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Assessment attempt not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const attempt = await this.assessmentRepository.findAttemptById(attemptId);

    if (!attempt || attempt.student_id !== user.id) {
      // Return 404 in both cases: no existence leak.
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Assessment attempt not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    request.assessmentAttempt = attempt;

    return true;
  }
}
