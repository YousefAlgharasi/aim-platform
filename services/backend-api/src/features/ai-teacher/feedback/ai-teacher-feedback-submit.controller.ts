/**
 * P8-076: Add AI Teacher API Guards (Group H — AI Teacher API Endpoints).
 * Completes P8-075 by exposing the `AiTeacherFeedbackSubmitService`
 * (P8-068) behind a guarded HTTP endpoint.
 *
 * Endpoint:
 *   POST /ai-teacher/messages/:messageId/feedback — Submit a helpful /
 *   not_helpful rating for an AI Teacher reply message.
 *
 * Security rules:
 *   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
 *   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser();
 *     never accepted from the request body.
 *   - The message referenced by :messageId must belong to the authenticated
 *     student (validated inside AiTeacherFeedbackSubmitService). If not,
 *     a 404 is returned — no existence leak.
 *   - Restricted to the STUDENT role.
 *   - No AI provider call is made here. No mastery/level/weakness/
 *     difficulty/recommendation/review-schedule value is computed
 *     (docs/phase-8/no-aim-replacement-rule.md).
 *   - DTO validation rejects a missing/invalid rating before the service
 *     is invoked. Errors are safe and generic — no internals are leaked.
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { AiTeacherFeedbackSubmitService } from './ai-teacher-feedback-submit.service';
import { SubmitTeacherFeedbackResult } from './ai-teacher-feedback-submit.types';
import { SubmitFeedbackRequestDto } from './ai-teacher-feedback-submit.dto';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class AiTeacherFeedbackSubmitController {
  constructor(
    private readonly feedbackSubmitService: AiTeacherFeedbackSubmitService,
  ) {}

  /**
   * POST /ai-teacher/messages/:messageId/feedback
   *
   * Record a helpful / not_helpful rating for an AI Teacher reply.
   * studentId is always resolved from the verified JWT — never from the body.
   */
  @Post('messages/:messageId/feedback')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit feedback for an AI Teacher reply (student).',
    description:
      'Records a helpful or not_helpful rating for an AI Teacher reply message. ' +
      'studentId always from JWT. No AI provider call is made.',
  })
  @ApiParam({ name: 'messageId', description: 'UUID of the AI Teacher reply message.' })
  @ApiCreatedResponse({ description: 'Feedback recorded.' })
  async submitFeedback(
    @ResolvedInternalUserId() studentId: string,
    @Param('messageId') messageId: string,
    @Body() body: unknown,
  ): Promise<SubmitTeacherFeedbackResult> {
    const dto = SubmitFeedbackRequestDto.fromBody(body);

    try {
      return await this.feedbackSubmitService.submitFeedback({
        studentId,
        messageId,
        rating: dto.rating,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      // Map service-level errors to safe HTTP responses — never leak internals.
      if (message.includes('message not found')) {
        throw new AppError({
          code: ApiErrorCode.NOT_FOUND,
          message: 'Message not found.',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      if (message.includes('feedback already recorded')) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: 'Feedback has already been submitted for this message.',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      if (message.includes('not an AI Teacher reply')) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Feedback can only be submitted for AI Teacher reply messages.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      throw new AppError({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred.',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
