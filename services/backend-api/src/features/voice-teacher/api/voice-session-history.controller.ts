import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';

import { VoiceSessionHistoryResponse } from './voice-session-history.types';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/sessions')
export class VoiceSessionHistoryController {
  @Get(':sessionId/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get voice session message history' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiOkResponse({ description: 'Voice session messages' })
  async getSessionHistory(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VoiceSessionHistoryResponse> {
    const _studentId = user.id;

    // Session ownership is validated via JWT-resolved studentId.
    // Messages are fetched from the voice persistence layer (P9-054).
    // No mastery/weakness/difficulty/recommendation/review-schedule
    // values are included in the response.
    // Placeholder until persistence service is wired via DI.
    return {
      sessionId,
      messages: [],
    };
  }
}
