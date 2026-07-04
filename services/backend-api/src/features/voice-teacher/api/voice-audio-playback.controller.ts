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
import { TtsAudioGenerationService } from '../tts-gateway/tts-audio-generation.service';
import { AiChatMessageRepository } from '../../ai-teacher/repositories/ai-chat-message.repository';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/audio')
export class VoiceAudioPlaybackController {
  constructor(
    private readonly audioStorage: TtsAudioStorageService,
    private readonly ttsAudioGeneration: TtsAudioGenerationService,
    private readonly chatMessageRepository: AiChatMessageRepository,
  ) {}

  /**
   * P21-011: Lazy on-demand TTS for text-originated `ai_chat_messages` rows.
   * A student who answered in the text chat has no audio for that AI reply
   * (P21-009 only eager-synthesizes the greeting) — if they later switch to
   * voice mode and want to hear a past turn, synthesize it here the first
   * time it's requested and cache the result on the row so a second request
   * for the same message never re-synthesizes.
   *
   * Registered before the opaque `:audioRef` route below so the literal
   * `message/` segment always wins.
   */
  @Get('message/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get (synthesizing on demand if needed) audio for a chat message' })
  @ApiParam({ name: 'messageId', type: String })
  @ApiOkResponse({ description: 'Audio stream' })
  async getAudioForMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const studentId = user.id;

    if (!messageId) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Message not found' });
      return;
    }

    const message = await this.chatMessageRepository.findById(messageId);

    if (!message || message.student_id !== studentId) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Message not found' });
      return;
    }

    let audioRef = message.audio_ref;

    if (!audioRef) {
      // Cache miss: synthesize now and persist it on the row so this only
      // ever happens once per message.
      const synthesis = await this.ttsAudioGeneration.synthesize({
        text: message.text,
        languageCode: 'en',
        sessionId: message.session_id,
        studentId,
      });

      if (synthesis.status !== 'success' || !synthesis.audioRef) {
        res.status(HttpStatus.BAD_GATEWAY).json({ error: 'Audio synthesis failed' });
        return;
      }

      await this.chatMessageRepository.updateAudio(
        messageId,
        synthesis.audioRef,
        synthesis.durationMs,
      );
      audioRef = synthesis.audioRef;
    }

    const audio = await this.audioStorage.retrieveAudio(audioRef, studentId);

    if (!audio) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
      return;
    }

    res.status(HttpStatus.OK).set('Content-Type', audio.contentType).send(audio.data);
  }

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
