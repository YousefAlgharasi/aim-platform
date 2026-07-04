import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import { TtsAudioStorageService } from '../tts-gateway/tts-audio-storage.service';

// P21-011: lazy on-demand TTS for text-originated ai_chat_messages rows is
// implemented by VoiceMessageAudioController
// (../message-audio/voice-message-audio.controller.ts, GET
// voice-teacher/messages/:messageId/audio) rather than here, to keep this
// controller scoped to streaming an already-known opaque audioRef.

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/audio')
export class VoiceAudioPlaybackController {
  constructor(private readonly audioStorage: TtsAudioStorageService) {}

  @Get(':audioRef')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stream voice audio by reference' })
  @ApiParam({ name: 'audioRef', type: String })
  @ApiOkResponse({ description: 'Audio stream' })
  async getAudio(
    @Param('audioRef') audioRef: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const studentId = user.id;

    // audioRef is opaque — no provider URL or filesystem path. Ownership is
    // enforced by TtsAudioStorageService.retrieveAudio: only the student who
    // generated this audio (studentId match) can retrieve it. No provider
    // credentials or AIM fields are ever returned.
    if (!audioRef) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
      return;
    }

    const audio = await this.audioStorage.retrieveAudio(audioRef, studentId);

    if (!audio) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
      return;
    }

    res.status(HttpStatus.OK).set('Content-Type', audio.contentType).send(audio.data);
  }
}
