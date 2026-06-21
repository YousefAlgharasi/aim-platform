// P10-032: AssessmentResultOwnershipGuard.
//
// Scope: Protect result-scoped assessment endpoints (e.g. viewing a graded
//        result). Verifies the authenticated student (from JWT) owns the
//        result for the attempt identified by the `attemptId` route param.
//
// Security rules:
//   - student_id is never trusted from client input — ownership is
//     resolved by looking up the result row via AssessmentResultService,
//     scoped to the authenticated student's id.
//   - Returns 404 (not 403) when the result does not exist or belongs to
//     a different student, to avoid leaking result existence.
//   - Computes no score/grading value — read-only ownership check; score,
//     passed, and latePenaltyApplied remain backend-authoritative values
//     persisted elsewhere (P10-029).
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';
import { AssessmentResultService, PersistedResult } from '../assessment-result.service';

export interface ResultOwnershipRequest extends AuthenticatedRequest {
  readonly params?: Record<string, string | undefined>;
  /** Attached by this guard so downstream handlers can reuse the loaded result. */
  assessmentResult?: PersistedResult;
}

@Injectable()
export class AssessmentResultOwnershipGuard implements CanActivate {
  constructor(private readonly assessmentResultService: AssessmentResultService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ResultOwnershipRequest>();
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
        message: 'Assessment result not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const result = await this.assessmentResultService.findByAttemptId(attemptId, user.id);

    if (!result) {
      // Return 404 in both cases: no existence leak.
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Assessment result not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    request.assessmentResult = result;

    return true;
  }
}
