/// <reference types="multer" />
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { VoiceSessionOwnershipGuard } from './guards/voice-session-ownership.guard';
import { AiChatSessionRepository } from '../../ai-teacher/repositories/ai-chat-session.repository';
import { VoiceOrchestratorService } from '../orchestrator/voice-orchestrator.service';

import { VoiceAudioSubmitResponse } from './voice-audio-submit.types';

const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
]);

const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Arabic-speaking English learners is this app's whole target audience
// (AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS); used only when the client omits
// languageCode, never as an AIM authority signal.
const DEFAULT_LANGUAGE_CODE = 'ar';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard, ResolveInternalUserIdGuard, VoiceSessionOwnershipGuard)
@Controller('voice-teacher/sessions')
export class VoiceAudioSubmitController {
  constructor(
    private readonly chatSessionRepository: AiChatSessionRepository,
    private readonly voiceOrchestrator: VoiceOrchestratorService,
  ) {}

  @Post(':sessionId/audio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit voice audio for a session turn' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Voice turn response with AI teacher reply' })
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: MAX_AUDIO_SIZE_BYTES },
    }),
  )
  async submitAudio(
    @Param('sessionId') sessionId: string,
    @ResolvedInternalUserId() studentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('languageCode') languageCode?: string,
  ): Promise<VoiceAudioSubmitResponse> {
    const turnStart = Date.now();

    if (!file || !file.buffer || file.buffer.length === 0) {
      return {
        text: 'عذرًا، لم يتم استلام الملف الصوتي. يرجى المحاولة مرة أخرى.',
        audioRef: null,
        isFallback: true,
        latencyMs: Date.now() - turnStart,
      };
    }

    if (!ALLOWED_AUDIO_TYPES.has(file.mimetype)) {
      return {
        text: 'عذرًا، نوع الملف الصوتي غير مدعوم.',
        audioRef: null,
        isFallback: true,
        latencyMs: Date.now() - turnStart,
      };
    }

    // VoiceSessionOwnershipGuard has already confirmed this session exists
    // and belongs to studentId; re-fetch here only to read its contextRef.
    // P21-007/P21-010: sessions live in ai_chat_sessions now.
    const session = await this.chatSessionRepository.findById(sessionId);
    const contextRef = session?.context_ref ?? '';

    const result = await this.voiceOrchestrator.handleTurn({
      studentId,
      sessionId,
      contextRef,
      audio: file.buffer,
      contentType: file.mimetype,
      languageCode: languageCode?.trim() || DEFAULT_LANGUAGE_CODE,
    });

    return {
      text: result.text,
      audioRef: result.audioRef,
      isFallback: result.isFallback,
      latencyMs: result.latencyMs,
    };
  }
}
