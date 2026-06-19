import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';

import { VoiceSessionListResponse } from './voice-session-list.types';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/sessions')
export class VoiceSessionListController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List voice teacher sessions for the current student' })
  @ApiOkResponse({ description: 'List of voice sessions' })
  async listSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VoiceSessionListResponse> {
    const _studentId = user.id;

    // studentId is resolved from JWT for ownership filtering.
    // Only sessions belonging to this student are returned.
    // No mastery/weakness/difficulty/recommendation/review-schedule
    // values are included.
    // Placeholder until VoiceSessionStartService is wired via DI.
    return { sessions: [] };
  }
}
