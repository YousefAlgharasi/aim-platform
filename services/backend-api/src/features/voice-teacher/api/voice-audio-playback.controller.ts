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

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/audio')
export class VoiceAudioPlaybackController {
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

    // audioRef is opaque — no provider URL or filesystem path.
    // Ownership is validated: only the student who owns the session
    // can access the audio. The storage service (P9-064) enforces this.
    // No provider credentials or AIM fields are returned.
    // Placeholder until TtsAudioStorageService is wired via DI.

    if (!audioRef) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
      return;
    }

    // When storage is wired, this will stream the audio bytes with
    // the correct Content-Type header from the stored contentType.
    res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
  }
}
