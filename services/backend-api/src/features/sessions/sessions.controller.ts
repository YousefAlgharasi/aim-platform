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
//   - studentId is ALWAYS resolved from the verified JWT via @CurrentUser() —
//     never accepted from the client, so there is no client-supplied
//     studentId to check ownership of. Neither route below has a
//     :studentId path param (bugfix: they previously carried
//     @RequireStudentOwnership() with no matching route param, which made
//     StudentOwnershipGuard's default paramName lookup always come back
//     empty and unconditionally reject every real student request with 403
//     "Student ownership target is missing" — no session could ever be
//     started or attempted, so the AIM pipeline's only trigger was
//     unreachable in production).
//   - is_correct, mastery, difficulty, weakness, recommendations, and all
//     other AIM-owned values are NEVER returned from these endpoints.
//   - The AIM Engine is called internally by the orchestrator after the
//     attempt is recorded. Clients never call the AIM Engine directly.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are exposed here.

import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser, ResolvedInternalUserId } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { ResolveInternalUserIdGuard } from '../../auth/authorization/resolve-internal-user-id.guard';
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
import { AimEngineClientService } from '../aim/aim-engine-client.service';
import {
  SessionQuestionsService,
  SessionLessonQuestionsResponse,
} from './session-questions.service';

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
    private readonly sessionQuestionsService: SessionQuestionsService,
    private readonly aimEngineClient: AimEngineClientService,
  ) {}

  // -------------------------------------------------------------------------
  // GET /sessions/:sessionId/questions?lessonId=...
  // -------------------------------------------------------------------------

  /**
   * GET /sessions/:sessionId/questions?lessonId=...
   *
   * Deliver the published questions for a lesson to the student's active
   * learning session. This is the student-reachable question-delivery path
   * for the P5-066/P5-067 session flow (no such endpoint previously existed;
   * the Phase 6 client pointed at the admin-gated /curriculum/questions/:id).
   *
   * Security rules:
   *   - studentId from JWT; session ownership + active status verified by
   *     SessionQuestionsService.verifyActiveSessionOwnership (a real DB
   *     lookup: session.student_id === JWT-resolved studentId). The route
   *     param here is :sessionId, not :studentId — bugfix: this previously
   *     also carried @RequireStudentOwnership() (default paramName
   *     'studentId'), which doesn't exist on this route either, so it
   *     unconditionally 403'd every request before the real ownership
   *     check below ever ran. Same bug family as startSession/
   *     submitAttempt above; StudentOwnershipGuard only makes sense on
   *     routes whose URL literally is /students/:studentId/....
   *   - P20-010 course gating enforced (403 for a locked course).
   *   - is_correct / correct answers are NEVER included in the response.
   */
  @Get(':sessionId/questions')
  @UseGuards(SupabaseJwtAuthGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deliver published lesson questions for an active learning session (student).',
    description:
      'Question options never include correctness data. ' +
      'Returns 403 when the lesson\'s course is locked for the student (P20-010).',
  })
  @ApiParam({ name: 'sessionId', description: 'UUID of the active learning session.' })
  @ApiQuery({ name: 'lessonId', description: 'UUID of the published lesson to practice.' })
  @ApiOkResponse({
    description: 'Published questions with student-safe options (no is_correct).',
  })
  async getSessionQuestions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Query('lessonId') lessonId?: string,
  ): Promise<SessionLessonQuestionsResponse> {
    if (!lessonId || lessonId.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'lessonId query parameter is required.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return this.sessionQuestionsService.listQuestionsForLesson(
      user.id, // JWT-resolved — never from query/body
      sessionId,
      lessonId,
    );
  }

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
  @UseGuards(SupabaseJwtAuthGuard, ResolveInternalUserIdGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new learning session (student).' })
  @ApiCreatedResponse({
    description: 'Session created. studentId always from JWT.',
  })
  async startSession(
    @CurrentUser() user: AuthenticatedUser,
    @ResolvedInternalUserId() internalUserId: string,
    @Body() body: StartSessionRequestBody,
  ): Promise<StartSessionResponse> {
    // Fire-and-forget warm-up ping: on a free/idle-sleeping AIM Engine
    // instance, the first real POST /aim/v1/analysis call after a period of
    // inactivity pays a cold-start penalty that can 502. Pinging GET /health
    // here — as soon as the student starts a session, well before they
    // answer their first question — gives that cold start a head start.
    // Never awaited: it must never delay or fail session creation.
    void this.aimEngineClient.checkHealth().catch(() => undefined);

    return this.sessionsService.startSession({
      studentId: user.id,     // JWT-resolved — never from body
      internalUserId,
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
  @UseGuards(SupabaseJwtAuthGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
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
    // Step 1: Resolve the backend-owned item fields, then record the attempt.
    //
    // SessionQuestionsService resolves everything the client must never
    // supply: isCorrect (evaluated against question_choices/question_answers),
    // skillIds (from question_skill_links), itemType, answerFormat,
    // presentedDifficulty, and optionsPresentedCount — all from the item
    // record the backend delivered. Only answerValue, itemId, and startedAt
    // come from the client body.
    // -----------------------------------------------------------------------

    const now = new Date().toISOString();

    const resolvedItem = await this.sessionQuestionsService.resolveItemForAttempt(
      body.itemId,
      body.answerValue,
    );

    const attemptInput: RecordLessonAttemptInput = {
      studentId: user.id,           // JWT-resolved — never from body
      learningSessionId: sessionId,
      itemId: body.itemId,
      itemType: resolvedItem.itemType,                     // backend-classified
      skillIds: [...resolvedItem.skillIds],                // backend-resolved
      presentedDifficulty: resolvedItem.presentedDifficulty, // backend-resolved
      answerFormat: resolvedItem.answerFormat,             // backend-classified
      answerValue: body.answerValue,
      optionsPresentedCount: resolvedItem.optionsPresentedCount,
      isCorrect: resolvedItem.isCorrect,                   // backend-evaluated
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
