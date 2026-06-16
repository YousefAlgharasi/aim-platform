// Phase 4 — P4-040 / P4-041 / P4-042 / P4-043 / P4-048 / P4-051
// PlacementController.
//
// Scope: Placement Test student endpoints only.
//
// Endpoints:
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
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { PlacementPermissionGuard } from './placement-permission.guard';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import { PlacementResultReadService, PlacementResultResponse } from './placement-result-read.service';
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
    private readonly resultRead: PlacementResultReadService,
  ) {}

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
    @Body() body: SubmitPlacementAnswerRequest,
  ): Promise<SubmitPlacementAnswerResponse> {
    return this.answerSubmit.submitAnswer(attemptId, user.id, body);
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
    return this.attemptComplete.completeAttempt(attemptId, user.id);
  }

  /**
   * GET /placement/attempts/:id/result
   * Fetch the student-safe placement result — only available after status = completed.
   * Returns estimatedLevel, skillSummary (signal only — no raw scores), initialPathReady.
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
}
