import {
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
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';

import { VoiceAudioSubmitResponse } from './voice-audio-submit.types';

const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
]);

const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/sessions')
export class VoiceAudioSubmitController {
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
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VoiceAudioSubmitResponse> {
    const studentId = user.id;

    if (!file || !file.buffer || file.buffer.length === 0) {
      return {
        text: 'عذرًا، لم يتم استلام الملف الصوتي. يرجى المحاولة مرة أخرى.',
        audioRef: null,
        isFallback: true,
        latencyMs: 0,
      };
    }

    if (!ALLOWED_AUDIO_TYPES.has(file.mimetype)) {
      return {
        text: 'عذرًا، نوع الملف الصوتي غير مدعوم.',
        audioRef: null,
        isFallback: true,
        latencyMs: 0,
      };
    }

    // The voice orchestrator (P9-048) handles STT → AI Teacher → TTS.
    // studentId is resolved from JWT, never from client input.
    // The orchestrator never returns mastery/weakness/difficulty/
    // recommendation/review-schedule values.
    // For now, return a placeholder until the orchestrator is wired
    // into this controller via dependency injection.
    const turnStart = Date.now();

    return {
      text: '',
      audioRef: null,
      isFallback: true,
      latencyMs: Date.now() - turnStart,
    };
  }
}
