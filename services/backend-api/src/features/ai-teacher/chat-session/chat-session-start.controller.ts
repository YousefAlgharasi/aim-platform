// P8-071: Create Start Chat API (Group H — AI Teacher API Endpoints).
//
// Endpoint:
//   POST /ai-teacher/sessions — Start a new, student-owned AI Teacher chat
//                               session (P8-063).
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser().
//     Clients must not and cannot supply a studentId; any such field in the
//     request body is ignored.
//   - Restricted to the STUDENT role.
//   - This endpoint never calls an AI provider directly and computes no
//     mastery/level/weakness/difficulty/recommendation/review-schedule value
//     (docs/phase-8/no-aim-replacement-rule.md). It only opens a session
//     row that later Phase 8 endpoints (message submission) operate on.
//   - DTO validation rejects missing/blank contextRef before the service is
//     invoked. Errors are returned as safe, generic messages — no internals
//     are leaked.

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { ChatSessionStartService } from './chat-session-start.service';
import { StartChatSessionResult } from './chat-session-start.types';
import { StartChatSessionRequestDto } from './chat-session-start.dto';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class ChatSessionStartController {
  constructor(private readonly chatSessionStartService: ChatSessionStartService) {}

  /**
   * POST /ai-teacher/sessions
   *
   * Start a new AI Teacher chat session for the authenticated student.
   * studentId is always resolved from the verified JWT — never from the body.
   */
  @Post('sessions')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start a new AI Teacher chat session (student).',
    description:
      'Creates a student-owned ai_chat_sessions row scoped to contextRef. ' +
      'studentId always from JWT. No AI provider call is made here.',
  })
  @ApiCreatedResponse({ description: 'Chat session created.' })
  async startSession(
    @ResolvedInternalUserId() studentId: string,
    @Body() body: unknown,
  ): Promise<StartChatSessionResult> {
    const dto = StartChatSessionRequestDto.fromBody(body);

    return this.chatSessionStartService.startSession({
      studentId,
      contextRef: dto.contextRef,
    });
  }
}
