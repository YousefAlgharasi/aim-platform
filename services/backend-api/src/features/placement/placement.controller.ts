// Phase 4 — P4-039 / P4-040 / P4-041 / P4-042 / P4-043 / P4-048 / P4-051
// PlacementController.
//
// Scope: Placement Test student endpoints only.
//
// Endpoints:
//   GET  /placement/sections                      — List sections of the active test.
//   GET  /placement/questions?sectionId=:id       — Deliver questions for a section.
//   POST /placement/attempts                       — Start a placement attempt.
//   POST /placement/attempts/:id/answers           — Submit a single answer.
//   POST /placement/attempts/:id/complete          — Complete placement attempt.
//   GET  /placement/attempts/:id/result            — Fetch placement result (after completion).
//
// Security rules:
//   - All endpoints guarded by SupabaseJwtAuthGuard (authentication) and
//     PlacementPermissionGuard (role enforcement) — P4-051.
//   - All student endpoints require AuthorizedRole.STUDENT.
//   - student_id always from JWT — never from client input.
//   - Attempt ownership enforced on all attempt-scoped endpoints.
//   - correct_answer, is_correct, overallScore, rawMastery never returned.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, or privileged config here.

/// <reference types="multer" />
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { PlacementPermissionGuard } from './placement-permission.guard';
import { PlacementTestReadService, PlacementTestActiveResponse } from './placement-test-read.service';
import { PlacementAttemptService } from './placement-attempt.service';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementQuestionAudioService } from './placement-question-audio.service';
import { TtsAudioStorageService } from '../voice-teacher/tts-gateway/tts-audio-storage.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import {
  PlacementResultReadService,
  PlacementResultResponse,
  PlacementLatestStatusResponse,
} from './placement-result-read.service';
import { PlacementResultService } from './placement-result.service';
import { PlacementInitialLearningPathService } from './placement-initial-learning-path.service';
import { PlacementLevelStateService } from './placement-level-state.service';
import { PlacementSectionsService, PlacementSectionSafeResponse } from './placement-sections.service';
import { SubmitPlacementAnswerDto } from './submit-placement-answer.dto';
import { SetPlacementDecisionDto } from './set-placement-decision.dto';
import {
  PlacementQuestionDeliveryResponse,
  PlacementAttemptStartResponse,
  SubmitPlacementAnswerResponse,
  SubmitPlacementSpeakingAnswerResponse,
  PlacementAttemptCompleteResponse,
} from './placement.types';
import { PlacementSpeakingAnswerSubmitService } from './placement-speaking-answer-submit.service';
import {
  PlacementDecisionService,
  PlacementGateStatusResponse,
} from './placement-decision.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';

const ALLOWED_SPEAKING_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
]);
const MAX_SPEAKING_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB, ~3 minutes of audio

@ApiTags('placement')
@Controller('placement')
export class PlacementController {
  constructor(
    private readonly testRead: PlacementTestReadService,
    private readonly attemptStart: PlacementAttemptService,
    private readonly sections: PlacementSectionsService,
    private readonly questionDelivery: PlacementQuestionDeliveryService,
    private readonly answerSubmit: PlacementAnswerSubmitService,
    private readonly attemptComplete: PlacementAttemptCompleteService,
    private readonly resultRead: PlacementResultReadService,
    private readonly resultCreate: PlacementResultService,
    private readonly initialPath: PlacementInitialLearningPathService,
    private readonly levelState: PlacementLevelStateService,
    private readonly questionAudio: PlacementQuestionAudioService,
    private readonly audioStorage: TtsAudioStorageService,
    private readonly speakingAnswerSubmit: PlacementSpeakingAnswerSubmitService,
    private readonly decision: PlacementDecisionService,
  ) {}

  /**
   * GET /placement/decision
   * First-login gate: whether to show "Take the placement test" vs "Start
   * from scratch", and the student's prior choice (if any).
   */
  @Get('decision')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get first-login placement gate status for the authenticated student.' })
  @ApiOkResponse({ description: 'should_show_gate + prior decision (if any).' })
  async getDecision(@CurrentUser() user: AuthenticatedUser): Promise<PlacementGateStatusResponse> {
    return this.decision.getGateStatus(user.id);
  }

  /**
   * POST /placement/decision
   * Persist the student's one-time first-login choice so the gate is never
   * shown again.
   */
  @Post('decision')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record the student\'s first-login placement gate decision.' })
  @ApiOkResponse({ description: 'Decision persisted; should_show_gate is now false.' })
  async setDecision(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetPlacementDecisionDto,
  ): Promise<PlacementGateStatusResponse> {
    return this.decision.setDecision(user.id, body.decision);
  }

  /**
   * GET /placement/active
   * Fetch the currently published placement test metadata (student-safe).
   * P4-006 endpoint #1. Response: P4-009 §4.
   */
  @Get('active')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the active placement test metadata (student-safe).' })
  @ApiOkResponse({ description: 'Active placement test summary. Internal fields excluded.' })
  async getActiveTest(): Promise<PlacementTestActiveResponse> {
    return this.testRead.getActiveTest();
  }

  /**
   * GET /placement/active/sections
   * List sections of the active placement test in order.
   * Alias for /placement/sections — used by the Flutter mobile app.
   */
  @Get('active/sections')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List sections of the active placement test (student-safe).' })
  @ApiOkResponse({ description: 'Ordered section list.' })
  async getActiveSections(): Promise<PlacementSectionSafeResponse[]> {
    return this.sections.getSections();
  }

  /**
   * POST /placement/attempts
   * Start a new placement attempt for the authenticated student.
   * Enforces retake policy (P4-049). P4-006 endpoint #4. Response: P4-013 §3.
   */
  @Post('attempts')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a placement attempt — retake policy enforced.' })
  @ApiCreatedResponse({ description: 'New placement attempt created. student_id from JWT.' })
  async startAttempt(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementAttemptStartResponse> {
    return this.attemptStart.startAttempt(user.id);
  }

  /**
   * GET /placement/sections
   * List sections of the active placement test in order.
   * P4-006 endpoint #2. Response: P4-010 §4.
   * Fields excluded: placement_test_id, created_at, updated_at.
   */
  @Get('sections')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List sections of the active placement test (student-safe).' })
  @ApiOkResponse({
    description: 'Ordered section list. Fields excluded: placement_test_id, created_at, updated_at.',
  })
  async getSections(): Promise<PlacementSectionSafeResponse[]> {
    return this.sections.getSections();
  }

  /**
   * GET /placement/questions?sectionId=:id
   * Deliver student-safe questions for a placement section.
   * P4-006 endpoint #3. Response: P4-011 §4.
   */
  @Get('questions')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deliver placement questions for a section (student-safe).' })
  @ApiQuery({ name: 'sectionId', required: true, description: 'UUID of the placement section.' })
  @ApiOkResponse({ description: 'Ordered student-safe questions. correct_answer never included.' })
  async getQuestions(
    @Query('sectionId') sectionId: string,
  ): Promise<PlacementQuestionDeliveryResponse> {
    return this.questionDelivery.getQuestionsForSection(sectionId);
  }

  /**
   * GET /placement/questions/:id/audio
   * Lazily synthesize and stream a listening_choice question's audio.
   * 404 when the question does not exist; 400 when it is not a listening
   * question; 204 No Content when it is a listening question with no
   * listening_script authored yet — a real content gap, not an error, so
   * the client can show "not available yet" rather than a generic failure
   * (204's empty body is distinguishable from real audio bytes without
   * needing the client to inspect Content-Type).
   */
  @Get('questions/:id/audio')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Synthesize and stream a listening question\'s audio (student).' })
  @ApiParam({ name: 'id', description: 'UUID of the placement question.' })
  @ApiQuery({ name: 'languageCode', required: false, type: String })
  @ApiOkResponse({ description: 'Audio stream. 204 (empty body) when no listening_script is authored yet.' })
  async getQuestionAudio(
    @Param('id') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
    @Query('languageCode') languageCode?: string,
  ): Promise<void> {
    const result = await this.questionAudio.ensureAudio(
      questionId,
      user.id,
      languageCode?.trim() || 'en',
    );

    if (result.scriptMissing) {
      res.status(HttpStatus.NO_CONTENT).send();
      return;
    }

    if (!result.audioRef) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not available' });
      return;
    }

    const audio = await this.audioStorage.retrieveAudio(result.audioRef, user.id);
    if (!audio) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' });
      return;
    }

    res.status(HttpStatus.OK).set('Content-Type', audio.contentType).send(audio.data);
  }

  /**
   * POST /placement/attempts/:id/answers
   * Submit a single answer. is_correct not evaluated or returned here.
   * P4-006 endpoint #5. Request/response: P4-012 §3.1.
   */
  @Post('attempts/:id/answers')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a placement answer (student).' })
  @ApiParam({ name: 'id', description: 'UUID of the active placement attempt.' })
  @ApiCreatedResponse({ description: 'Answer recorded. is_correct never returned during active attempt.' })
  async submitAnswer(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SubmitPlacementAnswerDto,
  ): Promise<SubmitPlacementAnswerResponse> {
    return this.answerSubmit.submitAnswer(attemptId, user.id, body);
  }

  /**
   * POST /placement/attempts/:id/answers/speaking
   * Submit a SPEAKING answer's recorded audio. Transcribed via the same STT
   * pipeline used for voice teacher, then AI-graded. Rejected once the
   * attempt's server-enforced timer has expired.
   */
  @Post('attempts/:id/answers/speaking')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a placement speaking answer (audio upload, student).' })
  @ApiParam({ name: 'id', description: 'UUID of the active placement attempt.' })
  @ApiCreatedResponse({ description: 'Audio transcribed + AI-graded. Transcript returned; score/feedback not exposed here.' })
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_SPEAKING_AUDIO_SIZE_BYTES } }),
  )
  async submitSpeakingAnswer(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('placement_question_id') placementQuestionId: string,
  ): Promise<SubmitPlacementSpeakingAnswerResponse> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new AppError({
        code: PlacementErrorCode.INVALID_ANSWER_VALUE,
        message: 'No audio file was received.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (!ALLOWED_SPEAKING_AUDIO_TYPES.has(file.mimetype)) {
      throw new AppError({
        code: PlacementErrorCode.INVALID_ANSWER_VALUE,
        message: `Unsupported audio type: ${file.mimetype}.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return this.speakingAnswerSubmit.submitSpeakingAnswer(attemptId, user.id, {
      placement_question_id: placementQuestionId,
      audio: file.buffer,
      contentType: file.mimetype,
    });
  }

  /**
   * POST /placement/attempts/:id/complete
   * Student signals done answering — transitions active → submitted.
   * Scoring triggers separately (P4-046). P4-006 endpoint #6.
   */
  @Post('attempts/:id/complete')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete a placement attempt — student signals done.' })
  @ApiParam({ name: 'id', description: 'UUID of the active placement attempt.' })
  @ApiOkResponse({ description: 'Attempt transitioned to submitted. Scoring is backend-only.' })
  async completeAttempt(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementAttemptCompleteResponse> {
    const response = await this.attemptComplete.completeAttempt(attemptId, user.id);

    const resultSummary = await this.resultCreate.createResult(attemptId);
    await this.initialPath.createInitialPath(resultSummary.resultId);
    // P20-006: seed student_level_state from this placement result so course
    // gating (P20-010/P20-011) has a starting ceiling to enforce against.
    await this.levelState.upsertFromPlacement(user.id, resultSummary.estimatedLevel);

    return response;
  }

  /**
   * GET /placement/attempts/:id/result
   * Fetch the student-safe placement result — only available after status = completed.
   * Returns estimated_level, skill_mastery_map (with signal), weakness_map, initial_path_id.
   * P4-006 endpoint #7. Response: P4-014 §5–6.
   */
  @Get('attempts/:id/result')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch placement result — available after attempt completion.' })
  @ApiParam({ name: 'id', description: 'UUID of the completed placement attempt.' })
  @ApiOkResponse({
    description:
      'Student-safe placement result. No raw scores, no internal skill keys, no overallScore.',
  })
  async getResult(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementResultResponse> {
    return this.resultRead.getResult(attemptId, user.id);
  }

  /**
   * GET /placement/attempts/latest
   * Fetch the student's overall placement status without requiring a known
   * attemptId — used by the mobile app's "Placement Test" menu entry to
   * decide between showing a completed result + retake option, an
   * in-progress resume, or the fresh start flow.
   */
  @Get('attempts/latest')
  @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Fetch the student's latest placement attempt status." })
  @ApiOkResponse({
    description:
      "status: 'none' | 'active' | 'submitted' | 'completed'. result is only populated when status is 'completed'.",
  })
  async getLatestStatus(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementLatestStatusResponse> {
    return this.resultRead.getLatestAttemptStatus(user.id);
  }
}
