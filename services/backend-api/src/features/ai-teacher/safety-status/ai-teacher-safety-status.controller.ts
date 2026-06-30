// P18-047: Create AI Safety Status API
//
// Endpoint:
//   GET /ai-teacher/sessions/:id/safety-status — Read the student-safe
//   safety status ('ok' | 'limited') for an AI Teacher chat session.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser().
//   - The session referenced by :id is loaded and its student_id checked
//     against the JWT user, exactly as in ChatHistoryReadController.
//     Cross-student access is rejected as not found (no existence leak).
//   - Restricted to the STUDENT role.
//   - Read-only. No AI provider call is made. Only the fixed 'ok'/'limited'
//     status and a timestamp are returned — never the raw reason_category
//     taxonomy or message/response text, and no mastery/level/weakness/
//     difficulty/recommendation/review-schedule value
//     (docs/phase-8/no-aim-replacement-rule.md).

import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { AiTeacherSafetyStatusService } from './ai-teacher-safety-status.service';
import { AiTeacherSafetyStatusResult } from './ai-teacher-safety-status.types';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class AiTeacherSafetyStatusController {
  constructor(
    private readonly safetyStatusService: AiTeacherSafetyStatusService,
    private readonly chatSessionRepository: AiChatSessionRepository,
  ) {}

  /**
   * GET /ai-teacher/sessions/:id/safety-status
   *
   * Return the student-safe safety status for the session. studentId is
   * always resolved from the verified JWT — never from the route or query.
   */
  @Get('sessions/:id/safety-status')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read the AI Teacher safety status for a session (student).',
    description:
      "Returns 'ok' or 'limited' for the session, derived from recorded " +
      'safety-filter outcomes. studentId always from JWT. No raw category ' +
      'or message/response text is exposed.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the AI Teacher chat session.' })
  @ApiOkResponse({ description: 'Safety status for the session.' })
  async getSafetyStatus(
    @ResolvedInternalUserId() studentId: string,
    @Param('id') sessionId: string,
  ): Promise<AiTeacherSafetyStatusResult> {
    const session = await this.chatSessionRepository.findById(sessionId);

    if (!session || session.student_id !== studentId) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Chat session not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.safetyStatusService.getStatus(session.id);
  }
}
