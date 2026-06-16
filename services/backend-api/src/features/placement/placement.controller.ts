// Phase 4 — P4-041
// PlacementController.
//
// Scope: Placement Test student endpoints.
//
// Endpoints (this task):
//   POST /placement/attempts — Start a new placement attempt (student).
//
// Security rules:
//   - All student endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - student_id is resolved from the JWT via StudentsService — never from client input.
//   - Backend is the sole authority for attempt status transitions.
//   - Flutter/client cannot set status, student_id, or placement_test_id.
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { StudentsService } from '../students/students.service';
import { PlacementAttemptService } from './placement-attempt.service';
import { PlacementAttemptStartResponse } from './placement.types';

@ApiTags('placement')
@Controller('placement')
export class PlacementController {
  constructor(
    private readonly attemptService: PlacementAttemptService,
    private readonly students: StudentsService,
  ) {}

  /**
   * POST /placement/attempts
   *
   * Starts a new placement attempt for the authenticated student.
   *
   * - Resolves the currently published placement test.
   * - Enforces one active attempt per student per test.
   * - Returns student-safe fields only (P4-013 §3.1).
   * - student_id is always resolved from the verified JWT — never from client input.
   *
   * Errors:
   *   409 ACTIVE_ATTEMPT_EXISTS — student already has an active attempt.
   *   404 NO_ACTIVE_TEST       — no placement test is currently published.
   */
  @Post('attempts')
  @UseGuards(SupabaseJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new placement attempt for the authenticated student.' })
  @ApiCreatedResponse({ description: 'Attempt started. Returns student-safe attempt fields.' })
  @ApiConflictResponse({ description: 'ACTIVE_ATTEMPT_EXISTS — student already has an active attempt.' })
  @ApiNotFoundResponse({ description: 'NO_ACTIVE_TEST — no placement test is currently published.' })
  async startAttempt(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlacementAttemptStartResponse> {
    // Resolve student profile from the verified JWT user ID.
    // student_id comes from the DB lookup — never from client input.
    const studentProfile = await this.students.getByUserId(user.id);

    return this.attemptService.startAttempt(studentProfile.id);
  }
}
