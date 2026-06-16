// Phase 4 — P4-040 (questions) / P4-041 (start attempt) / P4-042 (submit answer) / P4-043 (complete attempt)
// PlacementController.
//
// Scope: Placement Test student endpoints only.
//
// Endpoints:
//   GET  /placement/questions?sectionId=:id       — Deliver questions for a section (student).
//   POST /placement/attempts/:id/answers           — Submit a single answer (student).
//   POST /placement/attempts/:id/complete          — Complete placement attempt (student).
//
// Security rules:
//   - All student endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - correct_answer, is_correct, skill_code, and scoring data are never returned to clients.
//   - student_id is always sourced from the verified JWT — never from client input.
//   - Attempt ownership is enforced for all attempt-scoped endpoints.
//   - Backend is the sole authority for question content, answer correctness, and scoring.
//   - Flutter/client must never receive correct_answer, is_correct, or any correctness signal.
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import {
  Body,
  Controller,
  Get,
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
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import {
  PlacementQuestionDeliveryResponse,
  SubmitPlacementAnswerRequest,
  SubmitPlacementAnswerResponse,
  PlacementAttemptCompleteResponse,
} from './placement.types';

@ApiTags('placement')
@Controller('placement')
export class PlacementController {
  constructor(
    private readonly questionDelivery: PlacementQuestionDeliveryService,
    private readonly answerSubmit: PlacementAnswerSubmitService,
    private readonly attemptComplete: PlacementAttemptCompleteService,
  ) {}

  /**
   * GET /placement/questions?sectionId=:id
   *
   * Returns the student-safe question list for a given placement section.
   * correct_answer and skill_code are stripped before response.
   * Defined by P4-006 endpoint #3. Response shape: P4-011 §4.
   */
  @Get('questions')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deliver placement questions for a section (student-safe).' })
  @ApiQuery({
    name: 'sectionId',
    required: true,
    description: 'UUID of the placement section to fetch questions for.',
  })
  @ApiOkResponse({
    description: 'Ordered list of student-safe placement questions. correct_answer and skill_code are never included.',
  })
  async getQuestions(
    @Query('sectionId') sectionId: string,
  ): Promise<PlacementQuestionDeliveryResponse> {
    return this.questionDelivery.getQuestionsForSection(sectionId);
  }

  /**
   * POST /placement/attempts/:id/answers
   *
   * Submits a single student answer for a question within an active placement attempt.
   * is_correct is NOT evaluated and NEVER returned during an active attempt.
   * skill_code is inherited from the question — clients cannot set it.
   * Defined by P4-006 endpoint #5. Request/response: P4-012 §3.1.
   */
  @Post('attempts/:id/answers')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a placement answer for a question (student).' })
  @ApiParam({ name: 'id', description: 'UUID of the active placement attempt.' })
  @ApiCreatedResponse({
    description: 'Answer recorded. is_correct is never returned during an active attempt.',
  })
  async submitAnswer(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SubmitPlacementAnswerRequest,
  ): Promise<SubmitPlacementAnswerResponse> {
    return this.answerSubmit.submitAnswer(attemptId, user.id, body);
  }

  /**
   * POST /placement/attempts/:id/complete
   *
   * Signals that the student has finished answering and submits the attempt.
   * Transitions status: active → submitted.
   * Scoring and result generation (estimated_level, skill maps) is triggered
   * by the backend scoring service (P4-046) — NOT here and NOT by Flutter.
   * Defined by P4-006 endpoint #6. Response shape: P4-013 §3.2.
   */
  @Post('attempts/:id/complete')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete a placement attempt — student signals done answering.' })
  @ApiParam({ name: 'id', description: 'UUID of the active placement attempt to complete.' })
  @ApiOkResponse({
    description: 'Attempt transitioned to submitted. Scoring is handled by backend only.',
  })
  async completeAttempt(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementAttemptCompleteResponse> {
    return this.attemptComplete.completeAttempt(attemptId, user.id);
  }
}
