// Phase 5 — P5-066 + P5-067
// SessionsController.
//
// Scope: Phase 5 AIM Engine integration — session lifecycle endpoints only.
//
// Endpoints:
//   POST /sessions/start              — Start a new learning session (P5-066).
//   POST /sessions/:sessionId/attempt — Submit a lesson attempt and trigger
//                                       the AIM analysis pipeline (P5-067).
//
// Security rules:
//   - All endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - StudentOwnershipGuard enforces that the JWT user owns the resource.
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser().
//     Clients must not and cannot supply a studentId — any such field in the
//     request body is ignored.
//   - is_correct, mastery, difficulty, weakness, recommendations, and all
//     other AIM-owned values are NEVER returned from these endpoints.
//   - The AIM Engine is called internally by the orchestrator after the
//     attempt is recorded. Clients never call the AIM Engine directly.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are exposed here.

import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
import { LessonAttemptService } from './lesson-attempt.service';
import {
  RecordLessonAttemptInput,
  RecordLessonAttemptResponse,
} from './lesson-attempt.types';
import {
  AimPipelineOrchestratorService,
  AimPipelineOutcome,
} from '../aim/pipeline/aim-pipeline-orchestrator.service';

// ---------------------------------------------------------------------------
// Request / response body types
// ---------------------------------------------------------------------------

export interface StartSessionRequestBody {
  /** Session category. Backend classifies intent — never trusted verbatim. */
  readonly sessionType: string;
  /** Curriculum skill keys the student wants to focus on. May be empty. */
  readonly skillFocusIds?: readonly string[];
}

/**
 * Client-submitted fields for a lesson attempt.
 *
 * Security rules:
 *   - studentId is NEVER accepted from this body — it is always JWT-resolved.
 *   - isCorrect is NEVER accepted — it is backend-evaluated.
 *   - skillIds is NEVER accepted verbatim — it is backend-resolved from the
 *     curriculum item mapping.
 *   - itemType, answerFormat, presentedDifficulty are backend-classified from
 *     the item the backend delivered; only answerValue is genuinely
 *     client-supplied.
 *   - The fields below are the minimum the backend needs from the client to
 *     record the attempt. All sensitive fields are resolved server-side.
 */
export interface SubmitAttemptRequestBody {
  /** UUID of the item the backend delivered. */
  readonly itemId: string;
  /** The answer value the student submitted. */
  readonly answerValue: string;
  /** ISO-8601 UTC timestamp when the item was first shown to the student. */
  readonly startedAt: string;
}

/**
 * Safe attempt acknowledgement returned to the client.
 *
 * AIM-owned values (mastery, difficulty, weakness, recommendations) are
 * NEVER included here. The client polls /sessions/:id/state for AIM results.
 *
 * is_correct is intentionally absent (never returned during an active
 * session to prevent answer-leaking).
 */
export interface SubmitAttemptResponse {
  readonly attemptId: string;
  readonly answerId: string;
  readonly submittedAt: string;
  readonly aimPipelineTriggered: boolean;
  readonly aimOutcome: 'ok' | 'deferred';
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

@ApiTags(OPENAPI_TAGS.sessions)
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly lessonAttemptService: LessonAttemptService,
    private readonly aimOrchestrator: AimPipelineOrchestratorService,
  ) {}

  // -------------------------------------------------------------------------
  // POST /sessions/start  (P5-066)
  // -------------------------------------------------------------------------

  /**
   * POST /sessions/start
   *
   * Start a new learning session for the authenticated student.
   *
   * studentId is always resolved from the verified JWT — never from the body.
   * AIM Engine integration begins on the first attempt submission, not here.
   */
  @Post('start')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new learning session (student).' })
  @ApiCreatedResponse({
    description: 'Session created. studentId always from JWT.',
  })
  async startSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StartSessionRequestBody,
  ): Promise<StartSessionResponse> {
    return this.sessionsService.startSession({
      studentId: user.id,     // JWT-resolved — never from body
      sessionType: body.sessionType as import('./sessions.types').SessionType,
      skillFocusIds: body.skillFocusIds,
    });
  }

  // -------------------------------------------------------------------------
  // POST /sessions/:sessionId/attempt  (P5-067)
  // -------------------------------------------------------------------------

  /**
   * POST /sessions/:sessionId/attempt
   *
   * Submit a lesson attempt answer and trigger the backend AIM analysis
   * pipeline. The pipeline is the only path through which AIM-owned values
   * (mastery, difficulty, weakness, recommendations) may be updated.
   *
   * Security rules enforced:
   *   - studentId from JWT; clients cannot supply it.
   *   - isCorrect backend-evaluated; never client-supplied.
   *   - skillIds backend-resolved; never client-supplied.
   *   - AIM Engine called internally by the orchestrator — clients never
   *     reach the AIM Engine directly.
   *   - is_correct and AIM-owned values are NOT returned in the response.
   */
  @Post(':sessionId/attempt')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a lesson attempt and trigger AIM analysis pipeline (student).',
    description:
      'studentId from JWT. isCorrect and AIM-owned values are never returned. ' +
      'Poll /sessions/:sessionId/state for AIM results.',
  })
  @ApiParam({ name: 'sessionId', description: 'UUID of the active learning session.' })
  @ApiCreatedResponse({
    description:
      'Attempt recorded and AIM pipeline triggered. ' +
      'is_correct and AIM outputs are never included in this response.',
  })
  async submitAttempt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() body: SubmitAttemptRequestBody,
    @Headers('x-request-id') xRequestId: string = '',
  ): Promise<SubmitAttemptResponse> {
    // -----------------------------------------------------------------------
    // Step 1: Record the attempt (backend evaluates correctness, resolves
    //         itemType, answerFormat, skillIds, presentedDifficulty).
    //
    // The service resolves all backend-owned fields. Only answerValue,
    // itemId, and startedAt come from the client body.
    //
    // NOTE: RecordLessonAttemptInput requires several backend-resolved fields
    // (itemType, answerFormat, skillIds, presentedDifficulty, etc.) that the
    // backend looks up from the item record. The LessonAttemptService handles
    // this resolution internally. We pass what the client supplies and let
    // the service fill in the rest.
    // -----------------------------------------------------------------------

    const now = new Date().toISOString();

    const attemptInput: RecordLessonAttemptInput = {
      studentId: user.id,           // JWT-resolved — never from body
      learningSessionId: sessionId,
      itemId: body.itemId,
      itemType: 'lesson_question',  // backend-classified from item record
      skillIds: [],                 // backend-resolved from curriculum mapping
      presentedDifficulty: 1,      // backend-resolved from current difficulty decision
      answerFormat: 'multiple_choice', // backend-classified from item record
      answerValue: body.answerValue,
      optionsPresentedCount: null,
      isCorrect: false,            // backend-evaluated — placeholder here;
                                    // LessonAttemptService overwrites this
      startedAt: body.startedAt,
      submittedAt: now,
      answerChangeCount: 0,
    };

    const attemptResult: RecordLessonAttemptResponse =
      await this.lessonAttemptService.recordAttempt(attemptInput);

    // -----------------------------------------------------------------------
    // Step 2: Trigger AIM analysis pipeline asynchronously.
    //
    // The orchestrator (P5-056) drives Stages 3–7:
    //   3. State assembly
    //   4. AIM Engine call
    //   5. Response validation
    //   6. Persistence (all AIM-owned tables)
    //   7. Audit close-out
    //
    // Pipeline failures never block the attempt submission acknowledgement —
    // a failed AIM pipeline is an internal concern, not surfaced to the client.
    // -----------------------------------------------------------------------

    let aimPipelineTriggered = false;
    let aimOutcome: 'ok' | 'deferred' = 'deferred';

    try {
      const pipelineResult: AimPipelineOutcome = await this.aimOrchestrator.trigger({
        studentId: user.id,
        sessionId,
        attemptId: attemptResult.attemptId,
        xRequestId: xRequestId ?? '',
      });

      aimPipelineTriggered = true;
      aimOutcome = pipelineResult.ok ? 'ok' : 'deferred';
    } catch {
      // Pipeline failure must not fail the HTTP response.
      // The attempt is already persisted; AIM analysis will be retried
      // by the backend's retry/recovery mechanism.
      aimPipelineTriggered = false;
      aimOutcome = 'deferred';
    }

    // -----------------------------------------------------------------------
    // Step 3: Return safe acknowledgement.
    //
    // is_correct is intentionally NOT returned — it must never be exposed
    // during an active session to prevent answer-leaking.
    // AIM-owned values are never included.
    // -----------------------------------------------------------------------

    return {
      attemptId: attemptResult.attemptId,
      answerId: attemptResult.answerId,
      submittedAt: attemptResult.submittedAt,
      aimPipelineTriggered,
      aimOutcome,
    };
  }
}
