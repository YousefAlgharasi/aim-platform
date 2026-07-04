/**
 * P9-054/P21-007: Get voice session message history.
 *
 * Bugfix: this controller was a Phase 9 placeholder that always returned
 * `{ sessionId, messages: [] }` without ever querying anything — it was
 * never wired to a real persistence service, and (unlike every other voice
 * controller in this feature) was never even registered in a module, so
 * `GET /voice-teacher/sessions/:sessionId/messages` 404'd for every real
 * request. Since P21-007 unified voice and chat into the same
 * `ai_chat_sessions`/`ai_chat_messages` tables, this delegates directly to
 * the already-real `ChatHistoryReadService` (the same one the AI Teacher
 * chat screen uses) rather than duplicating a second history-reading
 * implementation.
 */
import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

import { ChatHistoryReadService } from '../../ai-teacher/chat-history/chat-history-read.service';
import { ChatHistoryMessage } from '../../ai-teacher/chat-history/chat-history-read.types';
import { VoiceMessageDto, VoiceSessionHistoryResponse } from './voice-session-history.types';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard, ResolveInternalUserIdGuard)
@Controller('voice-teacher/sessions')
export class VoiceSessionHistoryController {
  constructor(private readonly chatHistoryReadService: ChatHistoryReadService) {}

  @Get(':sessionId/messages')
  @ApiOperation({ summary: 'Get voice session message history' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiOkResponse({ description: 'Voice session messages' })
  async getSessionHistory(
    @Param('sessionId') sessionId: string,
    @ResolvedInternalUserId() studentId: string,
  ): Promise<VoiceSessionHistoryResponse> {
    const result = await this.chatHistoryReadService.getHistory({ studentId, sessionId });

    if (!result) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Voice session not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return {
      sessionId: result.sessionId,
      messages: result.messages.map(mapToVoiceMessageDto),
    };
  }
}

// `ChatHistoryMessage.role` is 'student' | 'ai_teacher' (the AI Teacher
// chat vocabulary); the Voice Teacher DTO/Flutter model was built against
// 'student' | 'teacher'. Map rather than change either side's established
// contract.
function mapToVoiceMessageDto(message: ChatHistoryMessage): VoiceMessageDto {
  return {
    id: message.id,
    role: message.role === 'ai_teacher' ? 'teacher' : 'student',
    text: message.text,
    audioRef: message.audioRef,
    createdAt: message.createdAt,
    channel: message.channel,
    audioDurationMs: message.audioDurationMs,
    isGreeting: message.isGreeting,
  };
}
