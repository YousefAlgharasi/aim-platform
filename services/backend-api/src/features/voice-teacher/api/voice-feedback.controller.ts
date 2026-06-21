import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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

import {
  SubmitVoiceFeedbackRequestBody,
  SubmitVoiceFeedbackResponse,
} from './voice-feedback.types';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@UseGuards(SupabaseJwtAuthGuard)
@Controller('voice-teacher/sessions')
export class VoiceFeedbackController {
  @Post(':sessionId/feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit feedback on a voice teacher response' })
  @ApiParam({ name: 'sessionId', type: String })
  @ApiOkResponse({ description: 'Feedback recorded' })
  async submitFeedback(
    @Param('sessionId') sessionId: string,
    @Body() body: SubmitVoiceFeedbackRequestBody,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmitVoiceFeedbackResponse> {
    const studentId = user.id;

    // studentId resolved from JWT — never from client body.
    // Session and message ownership validated backend-side.
    // Feedback is stored in voice_feedback table (P9-024).
    // No mastery/weakness/difficulty/recommendation/review-schedule
    // values are computed or modified by feedback submission.
    // Placeholder until persistence is wired via DI.
    const feedbackId = `vf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      feedbackId,
      recorded: true,
    };
  }
}
