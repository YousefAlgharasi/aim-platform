// P8-072: Create Send Message API (Group H — AI Teacher API Endpoints).
//
// Endpoint:
//   POST /ai-teacher/sessions/:id/messages — Submit a student chat message
//                                             and run the AI Teacher
//                                             response pipeline (P8-064,
//                                             P8-065).
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser();
//     never accepted from the request body.
//   - The session referenced by :id is loaded and its student_id checked
//     against the JWT user. Cross-student access to another student's
//     session is rejected as not found (no existence leak).
//   - Restricted to the STUDENT role.
//   - contextRef is never client-supplied — it is read from the session
//     row itself, set at session-start time (P8-071).
//   - This endpoint never calls an AI provider directly; the orchestrator
//     (P8-062) is the only caller of the provider gateway. Computes no
//     mastery/level/weakness/difficulty/recommendation/review-schedule
//     value (docs/phase-8/no-aim-replacement-rule.md).
//   - DTO validation rejects a missing/blank message before the pipeline
//     runs. Errors are returned as safe, generic messages — no internals
//     are leaked.

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

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
import { ChatMessageSubmitService } from './chat-message-submit.service';
import { SubmitStudentMessageResult } from './chat-message-submit.types';
import { SendChatMessageRequestDto } from './chat-message-submit.dto';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class ChatMessageSubmitController {
  constructor(
    private readonly chatMessageSubmitService: ChatMessageSubmitService,
    private readonly chatSessionRepository: AiChatSessionRepository,
  ) {}

  /**
   * POST /ai-teacher/sessions/:id/messages
   *
   * Submit a student chat message to an existing, owned AI Teacher
   * session and run the backend response pipeline. studentId is always
   * resolved from the verified JWT — never from the body. contextRef is
   * always read from the session row — never from the body.
   */
  @Post('sessions/:id/messages')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a chat message to an AI Teacher session (student).',
    description:
      'Runs the backend AI Teacher response pipeline for the given session. ' +
      'studentId always from JWT; contextRef always from the session row. ' +
      'Flutter never calls an AI provider directly.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the AI Teacher chat session.' })
  @ApiCreatedResponse({ description: 'AI Teacher response generated.' })
  async sendMessage(
    @ResolvedInternalUserId() studentId: string,
    @Param('id') sessionId: string,
    @Body() body: unknown,
  ): Promise<SubmitStudentMessageResult> {
    const dto = SendChatMessageRequestDto.fromBody(body);
    const session = await this.chatSessionRepository.findById(sessionId);

    if (!session || session.student_id !== studentId) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Chat session not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.chatMessageSubmitService.submitMessage({
      studentId,
      sessionId: session.id,
      contextRef: session.context_ref,
      studentMessage: dto.message,
    });
  }
}
