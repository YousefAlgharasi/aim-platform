// Phase 4 — P4-040
// PlacementController.
//
// Scope: Placement Test student endpoints only.
//
// Endpoints:
//   GET /placement/questions?sectionId=:id — Deliver questions for a section (student).
//
// Security rules:
//   - All student endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - correct_answer, skill_code, and scoring data are never returned to clients.
//   - Backend is the sole authority for question content and scoring.
//   - Flutter/client must never receive correct_answer or any correctness signal.
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementQuestionDeliveryResponse } from './placement.types';

@ApiTags('placement')
@Controller('placement')
export class PlacementController {
  constructor(
    private readonly questionDelivery: PlacementQuestionDeliveryService,
  ) {}

  /**
   * GET /placement/questions?sectionId=:id
   *
   * Returns the student-safe question list for a given placement section.
   *
   * Security:
   *   - Requires a valid Supabase JWT.
   *   - correct_answer, skill_code, and scoring data are stripped before response.
   *   - Backend is the sole authority for question content.
   *
   * Defined by P4-006 (API map) endpoint #3.
   * Response shape defined by P4-011 §4 (student-safe fields).
   */
  @Get('questions')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiTags('placement')
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
}
