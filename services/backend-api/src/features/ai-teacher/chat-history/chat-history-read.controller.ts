// P8-073: Create Chat History API (Group H — AI Teacher API Endpoints).
//
// Endpoint:
//   GET /ai-teacher/sessions/:id/messages — Read the persisted message
//                                            history for an AI Teacher
//                                            chat session (P8-067).
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser().
//   - The session referenced by :id is loaded and its student_id checked
//     against the JWT user. Cross-student access to another student's
//     session is rejected as not found (no existence leak).
//   - Restricted to the STUDENT role.
//   - Read-only. No AI provider call is made. No mastery/level/weakness/
//     difficulty/recommendation/review-schedule value is computed or
//     returned here (docs/phase-8/no-aim-replacement-rule.md).

import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

import { ChatHistoryReadService } from './chat-history-read.service';
import { GetChatHistoryResult } from './chat-history-read.types';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class ChatHistoryReadController {
  constructor(private readonly chatHistoryReadService: ChatHistoryReadService) {}

  /**
   * GET /ai-teacher/sessions/:id/messages
   *
   * Return the persisted message history for the session, ordered
   * oldest-first. studentId is always resolved from the verified JWT —
   * never from the route or query.
   */
  @Get('sessions/:id/messages')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read AI Teacher chat history for a session (student).',
    description:
      'Returns persisted messages, oldest-first. studentId always from JWT. ' +
      'No live AI provider call is made.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the AI Teacher chat session.' })
  @ApiOkResponse({ description: 'Chat history for the session.' })
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') sessionId: string,
  ): Promise<GetChatHistoryResult> {
    const result = await this.chatHistoryReadService.getHistory({
      studentId: user.id,
      sessionId,
    });

    if (!result) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Chat session not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result;
  }
}
