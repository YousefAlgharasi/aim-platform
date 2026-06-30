// P8-074: Create Chat Session List API (Group H — AI Teacher API Endpoints).
//
// Endpoint:
//   GET /ai-teacher/sessions — List the authenticated student's active AI
//                              Teacher chat sessions (P8-063).
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser().
//     There is no route/query studentId — cross-student listing is
//     structurally impossible.
//   - Restricted to the STUDENT role.
//   - Read-only. No AI provider call is made. No mastery/level/weakness/
//     difficulty/recommendation/review-schedule value is computed or
//     returned here (docs/phase-8/no-aim-replacement-rule.md).

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { ChatSessionListReadService } from './chat-session-list-read.service';
import { ListChatSessionsResult } from './chat-session-list-read.types';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class ChatSessionListReadController {
  constructor(private readonly chatSessionListReadService: ChatSessionListReadService) {}

  /**
   * GET /ai-teacher/sessions
   *
   * Return the authenticated student's active chat sessions, most
   * recently updated first. studentId is always resolved from the
   * verified JWT.
   */
  @Get('sessions')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List the authenticated student's active AI Teacher chat sessions.",
    description:
      'Returns active sessions, most recently updated first. studentId always from JWT. ' +
      'No live AI provider call is made.',
  })
  @ApiOkResponse({ description: "The student's active chat sessions." })
  async listSessions(
    @ResolvedInternalUserId() studentId: string,
  ): Promise<ListChatSessionsResult> {
    return this.chatSessionListReadService.listSessions({ studentId });
  }
}
