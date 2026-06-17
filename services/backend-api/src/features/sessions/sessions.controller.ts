// Phase 5 — P5-066
// SessionsController.
//
// Scope: Phase 5 AIM Engine integration — session lifecycle endpoints only.
//
// Endpoints:
//   POST /sessions/start — Start a new learning session (student-only).
//
// Security rules:
//   - All endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - StudentOwnershipGuard enforces that the JWT user matches the student:
//       * Resolves internal student from Supabase UID.
//       * Rejects any request attempting cross-student access.
//   - studentId is ALWAYS sourced from the verified JWT via @CurrentUser().
//     Clients must not and cannot supply a studentId in the request body —
//     any such field is ignored by the service.
//   - AIM Engine is never called from this controller. The controller only
//     triggers the session-start service (P5-052), which creates the session
//     row. AIM analysis is triggered downstream on attempt submission.
//   - No AIM-owned values (mastery, difficulty, weakness, recommendations)
//     are returned from this endpoint.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are exposed here.

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

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { StudentOwnershipGuard } from '../../auth/authorization/student-ownership.guard';
import { RequireStudentOwnership } from '../../auth/authorization/require-student-ownership.decorator';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';

import { SessionsService } from './sessions.service';
import { StartSessionResponse } from './sessions.types';

// ---------------------------------------------------------------------------
// Request body
// ---------------------------------------------------------------------------

export interface StartSessionRequestBody {
  /** Session category. Backend classifies intent; never trusts verbatim. */
  readonly sessionType: string;
  /** Curriculum skill keys the student wants to focus on. May be empty. */
  readonly skillFocusIds?: readonly string[];
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

@ApiTags(OPENAPI_TAGS.sessions)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * POST /sessions/start
   *
   * Start a new learning session for the authenticated student.
   *
   * studentId is always resolved from the verified JWT — never from the
   * request body. The client must not submit a studentId field.
   *
   * AIM Engine integration begins on the first attempt submission, not here.
   *
   * Returns the created session metadata. AIM-owned values (mastery,
   * difficulty, weakness, recommendations) are never included in this
   * response.
   */
  @Post('start')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start a new learning session (student).',
    description:
      'studentId is resolved from the verified JWT. ' +
      'AIM Engine integration begins on the first attempt submission.',
  })
  @ApiCreatedResponse({
    description: 'Session created. studentId always from JWT — not from body.',
  })
  async startSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StartSessionRequestBody,
  ): Promise<StartSessionResponse> {
    return this.sessionsService.startSession({
      studentId: user.id,           // JWT-resolved — never from body
      sessionType: body.sessionType as import('./sessions.types').SessionType,
      skillFocusIds: body.skillFocusIds,
    });
  }
}
