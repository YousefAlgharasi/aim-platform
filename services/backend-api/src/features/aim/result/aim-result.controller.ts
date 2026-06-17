// Phase 5 — P5-069 + P5-070 + P5-071 + P5-072 + P5-068
// AimResultController.
//
// Scope: Read-only AIM result endpoints. Exposes backend-validated, persisted
//        AIM outputs. Never proxies a live AIM Engine call.
//
// Endpoints:
//   GET /aim/students/:studentId/skill-states — Read student skill states (P5-069).
//   GET /aim/students/:studentId/review-schedules — Read review schedules (P5-072).
//   GET /aim/students/:studentId/sessions/:sessionId/state — Read session AIM state (P5-068).
//   GET /aim/students/:studentId/weakness-records — Read weakness records (P5-070).
//   GET /aim/students/:studentId/recommendations — Read recommendations (P5-071).
//
// History: a prior merge (PR #317, P5-071) was based on a main commit that
// predated the P5-072 and P5-068 merges and silently dropped their
// controller wiring and module registrations on merge (the underlying
// service files were untouched — only this controller and aim.module.ts
// lost the review-schedule and session-state registrations). Restored here
// while adding the P5-070 weakness-records endpoint in the same pass.
//
// Security rules:
//   - All endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - StudentOwnershipGuard validates :studentId against the JWT user.
//   - Clients cannot access another student's AIM data.
//   - Read-only. No AIM-owned value may be written through this controller.
//   - This controller never calls the AIM Engine directly.
//   - No secrets, service-role keys, or AI provider keys are exposed here.

import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { StudentOwnershipGuard } from '../../../auth/authorization/student-ownership.guard';
import { RequireStudentOwnership } from '../../../auth/authorization/require-student-ownership.decorator';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import {
  StudentSkillStateReadService,
  StudentSkillStateReadResponse,
} from './student-skill-state-read.service';
import {
  ReviewScheduleReadService,
  ReviewScheduleReadResponse,
} from './review-schedule-read.service';
import {
  SessionStateReadService,
  SessionStateReadResponse,
} from './session-state-read.service';
import {
  WeaknessRecordsReadService,
  WeaknessRecordsReadResponse,
} from './weakness-records-read.service';
import {
  RecommendationReadService,
  RecommendationReadResponse,
} from './recommendation-read.service';
import {
  RecommendationReadResponseDto,
  ReviewScheduleReadResponseDto,
  SessionStateReadResponseDto,
  StudentSkillStateReadResponseDto,
  WeaknessRecordsReadResponseDto,
} from './aim-result.dto';

@ApiTags(OPENAPI_TAGS.aim)
@Controller('aim')
export class AimResultController {
  constructor(
    private readonly skillStateReadService: StudentSkillStateReadService,
    private readonly reviewScheduleReadService: ReviewScheduleReadService,
    private readonly sessionStateReadService: SessionStateReadService,
    private readonly weaknessRecordsReadService: WeaknessRecordsReadService,
    private readonly recommendationReadService: RecommendationReadService,
  ) {}

  /**
   * GET /aim/students/:studentId/skill-states  (P5-069)
   *
   * Return all persisted, backend-validated skill states for the student.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via StudentOwnershipGuard.
   *
   * Returns only last-AIM-validated values from student_skill_states. No
   * live AIM Engine call is made. If no states exist, returns an empty array.
   */
  @Get('students/:studentId/skill-states')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read backend-validated student skill states (student).',
    description:
      'Returns AIM-persisted skill states. No live AIM Engine call. ' +
      'studentId in route validated against JWT.',
  })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({
    description: 'Backend-validated skill states. Empty array if none yet persisted.',
    type: StudentSkillStateReadResponseDto,
  })
  async getSkillStates(
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<StudentSkillStateReadResponse> {
    return this.skillStateReadService.getSkillStatesForStudent(studentId);
  }

  /**
   * GET /aim/students/:studentId/review-schedules  (P5-072)
   *
   * Return all persisted, backend-validated review schedules for the student.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via StudentOwnershipGuard.
   *
   * Returns only last-AIM-validated values from review_schedules. No live
   * AIM Engine call is made. If no schedules exist, returns an empty array.
   */
  @Get('students/:studentId/review-schedules')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read backend-validated review schedules (student).',
    description:
      'Returns AIM-persisted review schedules. No live AIM Engine call. ' +
      'studentId in route validated against JWT.',
  })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({
    description: 'Backend-validated review schedules. Empty array if none yet persisted.',
    type: ReviewScheduleReadResponseDto,
  })
  async getReviewSchedules(
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<ReviewScheduleReadResponse> {
    return this.reviewScheduleReadService.getReviewSchedulesForStudent(studentId);
  }

  /**
   * GET /aim/students/:studentId/sessions/:sessionId/state  (P5-068)
   *
   * Return the AIM-persisted state snapshot for a specific session.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via StudentOwnershipGuard.
   * sessionId is additionally checked to belong to the same student_id.
   */
  @Get('students/:studentId/sessions/:sessionId/state')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read backend-validated session AIM state (student).',
    description:
      'Returns the AIM-persisted session summary. No live AIM Engine call. ' +
      'studentId in route validated against JWT; sessionId additionally ' +
      'checked against student_id in the query.',
  })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiParam({ name: 'sessionId', description: 'UUID of the learning session.' })
  @ApiOkResponse({
    description: 'Backend-validated session state. found: false if not yet persisted.',
    type: SessionStateReadResponseDto,
  })
  async getSessionState(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<SessionStateReadResponse> {
    return this.sessionStateReadService.getSessionState(studentId, sessionId);
  }

  /**
   * GET /aim/students/:studentId/weakness-records  (P5-070)
   *
   * Return all persisted, backend-validated weakness records for the student.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via StudentOwnershipGuard.
   *
   * Returns only last-AIM-validated values from weakness_records. No live
   * AIM Engine call is made. If no weakness records exist, returns an
   * empty array.
   */
  @Get('students/:studentId/weakness-records')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read backend-validated weakness records (student).',
    description:
      'Returns AIM-persisted weakness records. No live AIM Engine call. ' +
      'studentId in route validated against JWT.',
  })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({
    description: 'Backend-validated weakness records. Empty array if none yet persisted.',
    type: WeaknessRecordsReadResponseDto,
  })
  async getWeaknessRecords(
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<WeaknessRecordsReadResponse> {
    return this.weaknessRecordsReadService.getWeaknessRecordsForStudent(studentId);
  }

  /**
   * GET /aim/students/:studentId/recommendations  (P5-071)
   *
   * Return active AIM-persisted recommendations for the student, ordered
   * by rank ASC. Only status='active' entries returned. No live AIM call.
   */
  @Get('students/:studentId/recommendations')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read active AIM recommendations for a student (student).' })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({
    description: 'Active recommendations ordered by rank. Empty array if none.',
    type: RecommendationReadResponseDto,
  })
  async getRecommendations(
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<RecommendationReadResponse> {
    return this.recommendationReadService.getActiveForStudent(studentId);
  }
}
