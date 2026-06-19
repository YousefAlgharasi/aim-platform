import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';

import {
  StartVoiceSessionRequestBody,
  StartVoiceSessionResponse,
} from './voice-session-start.types';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/sessions')
export class VoiceSessionStartController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new voice teacher session' })
  @ApiCreatedResponse({ description: 'Voice session created' })
  async startSession(
    @Body() body: StartVoiceSessionRequestBody,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StartVoiceSessionResponse> {
    const studentId = user.id;

    // studentId is resolved from JWT, never from client body.
    // The voice session start service (P9-049) creates the session
    // record and returns a session ID.
    // contextRef is an optional curriculum reference for the AI Teacher.
    // No mastery/weakness/difficulty/recommendation/review-schedule
    // values are computed or returned here.
    const _contextRef = body.contextRef;

    // Placeholder until VoiceSessionStartService is wired via DI.
    const sessionId = `vs_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      sessionId,
      createdAt: new Date().toISOString(),
    };
  }
}
