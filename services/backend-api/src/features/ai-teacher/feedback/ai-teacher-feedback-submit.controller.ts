// P8-075: Create AI Teacher Feedback API (Group H — AI Teacher API
// Endpoints).
//
// Endpoint:
//   POST /ai-teacher/messages/:id/feedback — Submit a helpful/not_helpful
//                                            rating for an AI Teacher
//                                            reply (P8-068).
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser();
//     never accepted from the request body.
//   - Message ownership and role ('ai_teacher' only) are enforced inside
//     AiTeacherFeedbackSubmitService (P8-068); cross-student or
//     wrong-role attempts are surfaced as safe, generic errors here, never
//     internal details.
//   - Restricted to the STUDENT role.
//   - Feedback is advisory only and never calls an AI provider; it never
//     feeds the AIM Engine and computes no mastery/level/weakness/
//     difficulty/recommendation/review-schedule value
//     (docs/phase-8/no-aim-replacement-rule.md).
//   - DTO validation rejects a missing/invalid rating or messageId before
//     the service is invoked.

import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

import { AiTeacherFeedbackSubmitService } from './ai-teacher-feedback-submit.service';
import { SubmitTeacherFeedbackRequestDto } from './ai-teacher-feedback-submit.dto';
import { SubmitTeacherFeedbackResult } from './ai-teacher-feedback-submit.types';

const NOT_FOUND_MESSAGE = 'message not found';
const ROLE_MESSAGE = 'not an AI Teacher reply';
const DUPLICATE_MESSAGE = 'already recorded';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class AiTeacherFeedbackSubmitController {
  constructor(private readonly feedbackSubmitService: AiTeacherFeedbackSubmitService) {}

  /**
   * POST /ai-teacher/messages/:id/feedback
   *
   * Submit a helpful/not_helpful rating for an AI Teacher reply.
   * studentId is always resolved from the verified JWT — never from the
   * body. Errors from the service (message not found, wrong role,
   * duplicate feedback) are translated to safe, specific HTTP errors —
   * no internal details are exposed.
   */
  @Post('messages/:id/feedback')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit feedback on an AI Teacher reply (student).',
    description:
      'Records a helpful/not_helpful rating. studentId always from JWT. ' +
      'Feedback is advisory only and is never read by the AIM Engine.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the AI Teacher reply message.' })
  @ApiCreatedResponse({ description: 'Feedback recorded.' })
  async submitFeedback(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') messageId: string,
    @Body() body: unknown,
  ): Promise<SubmitTeacherFeedbackResult> {
    const dto = SubmitTeacherFeedbackRequestDto.fromBody(body);

    try {
      return await this.feedbackSubmitService.submitFeedback({
        studentId: user.id,
        messageId,
        rating: dto.rating,
      });
    } catch (error) {
      throw this.toSafeError(error);
    }
  }

  private toSafeError(error: unknown): AppError {
    const message = error instanceof Error ? error.message : '';

    if (message.includes(NOT_FOUND_MESSAGE)) {
      return new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Message not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (message.includes(ROLE_MESSAGE)) {
      return new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Feedback can only be submitted for an AI Teacher reply.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (message.includes(DUPLICATE_MESSAGE)) {
      return new AppError({
        code: ApiErrorCode.CONFLICT,
        message: 'Feedback has already been recorded for this message.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    return new AppError({
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Unable to record feedback.',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
