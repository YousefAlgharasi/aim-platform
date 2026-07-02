// P18-043: Create AI Streaming Message API
//
// Endpoint:
//   POST /ai-teacher/sessions/:id/messages/stream — Submit a student chat
//   message and stream the backend-approved AI Teacher reply back as
//   server-sent events.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser();
//     never accepted from the request body.
//   - The session referenced by :id is loaded and its student_id checked
//     against the JWT user, exactly as in ChatMessageSubmitController.
//     Cross-student access is rejected as not found (no existence leak).
//   - Restricted to the STUDENT role.
//   - Only a fully safety-filtered reply is ever streamed — chunking
//     happens after AiTeacherOrchestratorService.handleTurn has already
//     applied rate limiting, the provider call, and the response safety
//     filter (P8-066). No raw/unsafety-checked provider output reaches
//     the client.
//   - Computes no mastery/level/weakness/difficulty/recommendation/
//     review-schedule value (docs/phase-8/no-aim-replacement-rule.md).

import { Body, Controller, HttpStatus, MessageEvent, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

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
import { AiTeacherStreamMessageService } from './ai-teacher-stream-message.service';
import { StreamChatMessageRequestDto } from './ai-teacher-stream-message.dto';

@ApiTags(OPENAPI_TAGS.aiTeacher)
@Controller('ai-teacher')
export class AiTeacherStreamMessageController {
  constructor(
    private readonly streamMessageService: AiTeacherStreamMessageService,
    private readonly chatSessionRepository: AiChatSessionRepository,
  ) {}

  /**
   * POST /ai-teacher/sessions/:id/messages/stream
   *
   * Submit a student chat message to an existing, owned AI Teacher
   * session and stream the backend-approved reply as SSE chunks.
   * studentId is always resolved from the verified JWT — never from the
   * body. contextRef is always read from the session row — never from
   * the body.
   */
  // @Sse() defaults its route to GET (nestjs/common's Sse decorator hard-codes
  // RequestMethod.GET unless overridden) — this endpoint needs the student's
  // message in the body, so @Post() must come after @Sse() in this stack:
  // decorators apply bottom-up, so @Post()'s method metadata is written last
  // and wins, while @Sse() still marks the route as an SSE response.
  @Post('sessions/:id/messages/stream')
  @Sse('sessions/:id/messages/stream')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Stream an AI Teacher reply to a chat message (student).',
    description:
      'Runs the same backend AI Teacher response pipeline as the non-streaming ' +
      'send-message endpoint, then streams the already safety-filtered reply ' +
      'as server-sent events. studentId always from JWT; contextRef always ' +
      'from the session row.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the AI Teacher chat session.' })
  @ApiOkResponse({ description: 'Server-sent event stream of the AI Teacher reply.' })
  streamMessage(
    @ResolvedInternalUserId() studentId: string,
    @Param('id') sessionId: string,
    @Body() body: unknown,
  ): Observable<MessageEvent> {
    const dto = StreamChatMessageRequestDto.fromBody(body);

    return new Observable<MessageEvent>((subscriber) => {
      let cancelled = false;

      (async () => {
        const session = await this.chatSessionRepository.findById(sessionId);

        if (!session || session.student_id !== studentId) {
          subscriber.error(
            new AppError({
              code: ApiErrorCode.NOT_FOUND,
              message: 'Chat session not found.',
              statusCode: HttpStatus.NOT_FOUND,
            }),
          );
          return;
        }

        try {
          for await (const event of this.streamMessageService.streamTurn({
            studentId,
            sessionId: session.id,
            contextRef: session.context_ref,
            studentMessage: dto.message,
          })) {
            if (cancelled) return;
            subscriber.next({ data: event });
          }
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();

      return () => {
        cancelled = true;
      };
    });
  }
}
