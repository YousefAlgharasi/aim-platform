// Phase 4 — P4-040 (questions) / P4-041 (start attempt) / P4-042 (submit answer)
// PlacementController.
//
// Scope: Placement Test student endpoints only.
//
// Endpoints:
//   GET  /placement/questions?sectionId=:id       — Deliver questions for a section (student).
//   POST /placement/attempts/:id/answers           — Submit a single answer (student).
//
// Security rules:
//   - All student endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - correct_answer, is_correct, skill_code, and scoring data are never returned to clients.
//   - student_id is always sourced from the verified JWT — never from client input.
//   - Attempt ownership is enforced: a student may only submit answers to their own active attempt.
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
import {
  PlacementQuestionDeliveryResponse,
  SubmitPlacementAnswerRequest,
  SubmitPlacementAnswerResponse,
} from './placement.types';

@ApiTags('placement')
@Controller('placement')
export class PlacementController {
  constructor(
    private readonly questionDelivery: PlacementQuestionDeliveryService,
    private readonly answerSubmit: PlacementAnswerSubmitService,
  ) {}

  /**
   * GET /placement/questions?sectionId=:id
   *
   * Returns the student-safe question list for a given placement section.
   *
   * Security:
   *   - Requires a valid Supabase JWT.
   *   - correct_answer and skill_code are stripped before response.
   *   - Backend is the sole authority for question content.
   *
   * Defined by P4-006 (API map) endpoint #3.
   * Response shape defined by P4-011 §4 (student-safe fields).
   */
  @Get('questions')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deliver placement questions for a section (student-safe).',
  })
  @ApiQuery({
    name: 'sectionId',
    required: true,
    description: 'UUID of the placement section to fetch questions for.',
  })
  @ApiOkResponse({
    description:
      'Ordered list of student-safe placement questions. correct_answer and skill_code are never included.',
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
   *
   * Security:
   *   - Requires a valid Supabase JWT.
   *   - student_id is sourced from the JWT — clients cannot supply it.
   *   - Attempt ownership is enforced: the attempt must belong to the requesting student.
   *   - is_correct is NOT evaluated here and is NEVER returned during an active attempt.
   *   - skill_code is inherited from the question — clients cannot set it.
   *   - Backend is the sole authority for answer correctness and scoring.
   *
   * Defined by P4-006 (API map) endpoint #5.
   * Request/response shape defined by P4-012 §3.1 (student-safe fields).
   */
  @Post('attempts/:id/answers')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a placement answer for a question (student).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the active placement attempt.',
  })
  @ApiCreatedResponse({
    description:
      'Answer recorded. is_correct is never returned during an active attempt.',
  })
  async submitAnswer(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SubmitPlacementAnswerRequest,
  ): Promise<SubmitPlacementAnswerResponse> {
    return this.answerSubmit.submitAnswer(attemptId, user.id, body);
  }
}
