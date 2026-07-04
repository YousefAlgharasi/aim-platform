import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { ResolveInternalUserIdGuard } from '../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../auth/current-user.decorator';
import { TtsAudioStorageService } from '../tts-gateway/tts-audio-storage.service';
import { VoiceMessageAudioService } from './voice-message-audio.service';

const DEFAULT_LANGUAGE_CODE = 'ar';

/**
 * P21-011: given an `ai_chat_messages` id, ensure its audio exists
 * (synthesizing on first request, reusing the cached `audio_ref` on every
 * subsequent one) and stream the resulting audio bytes back. This lets the
 * voice screen play a message that originated in the text chat.
 */
@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard, ResolveInternalUserIdGuard)
@Controller('voice-teacher/messages')
export class VoiceMessageAudioController {
  constructor(
    private readonly messageAudioService: VoiceMessageAudioService,
    private readonly audioStorage: TtsAudioStorageService,
  ) {}

  @Get(':messageId/audio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lazily synthesize (or reuse) and stream a message\'s audio' })
  @ApiParam({ name: 'messageId', type: String })
  @ApiQuery({ name: 'languageCode', required: false, type: String })
  @ApiOkResponse({ description: 'Audio stream' })
  async getMessageAudio(
    @Param('messageId') messageId: string,
    @ResolvedInternalUserId() studentId: string,
    @Res() res: Response,
    @Query('languageCode') languageCode?: string,
  ): Promise<void> {
    const result = await this.messageAudioService.ensureAudio(
      messageId,
      studentId,
      languageCode?.trim() || DEFAULT_LANGUAGE_CODE,
    );

    if (!result.audioRef) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not available' });
      return;
    }

    const audio = await this.audioStorage.retrieveAudio(result.audioRef, studentId);

    if (!audio) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
      return;
    }

    res.status(HttpStatus.OK).set('Content-Type', audio.contentType).send(audio.data);
  }
}
