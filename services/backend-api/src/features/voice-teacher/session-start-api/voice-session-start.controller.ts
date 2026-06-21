// P9-068: Create Start Voice Session API (Group H — Voice API Endpoints).
//
// Endpoint:
//   POST /voice-teacher/sessions — Start a new, student-owned Voice Mode
//                                  session, backed by VoiceSessionStartService
//                                  (P9-049).
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser().
//     Clients must not and cannot supply a studentId; any such field in the
//     request body is ignored.
//   - Restricted to the STUDENT role.
//   - This endpoint never calls an STT/TTS/AI provider directly and
//     computes no mastery/level/weakness/difficulty/recommendation/
//     review-schedule value (docs/phase-9/no-aim-authority-change-rule.md).
//     It only opens a session row that later Voice Mode endpoints
//     (audio submit) operate on.
//   - DTO validation rejects missing/blank contextRef before the service is
//     invoked. Errors are returned as safe, generic messages — no internals
//     are leaked.

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { VoiceSessionStartService } from '../session-start/voice-session-start.service';
import { StartVoiceSessionResult } from '../session-start/voice-session-start.types';
import { StartVoiceSessionRequestDto } from './voice-session-start.dto';

@ApiTags(OPENAPI_TAGS.voiceTeacher)
@Controller('voice-teacher')
export class VoiceSessionStartController {
  constructor(private readonly voiceSessionStartService: VoiceSessionStartService) {}

  /**
   * POST /voice-teacher/sessions
   *
   * Start a new Voice Mode session for the authenticated student.
   * studentId is always resolved from the verified JWT — never from the body.
   */
  @Post('sessions')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start a new Voice Mode session (student).',
    description:
      'Creates a student-owned voice_sessions row scoped to contextRef. ' +
      'studentId always from JWT. No STT/TTS/AI provider call is made here.',
  })
  @ApiCreatedResponse({ description: 'Voice session created.' })
  async startSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ): Promise<StartVoiceSessionResult> {
    const dto = StartVoiceSessionRequestDto.fromBody(body);

    return this.voiceSessionStartService.startSession({
      studentId: user.id,
      contextRef: dto.contextRef,
    });
  }
}
