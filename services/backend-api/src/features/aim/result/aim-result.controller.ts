// Phase 5 — P5-069
// AimResultController.
//
// Scope: Read-only AIM result endpoints. Exposes backend-validated, persisted
//        AIM outputs. Never proxies a live AIM Engine call.
//
// Endpoints:
//   GET /aim/students/:studentId/skill-states — Read student skill states (P5-069).
//   GET /aim/students/:studentId/review-schedules — Read review schedules (P5-072).
//   GET /aim/students/:studentId/sessions/:sessionId/state — Read session AIM state (P5-068).
//
// Security rules:
//   - All endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - StudentOwnershipGuard enforces that the JWT user owns the :studentId param.
//   - studentId in the route is validated against the JWT user — clients
//     cannot access another student's skill states.
//   - Read-only. No AIM-owned value may be written through this controller.
//   - This controller never calls the AIM Engine directly.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are exposed here.

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

@ApiTags(OPENAPI_TAGS.aim ?? 'aim')
@Controller('aim')
export class AimResultController {
  constructor(
    private readonly skillStateReadService: StudentSkillStateReadService,
    private readonly reviewScheduleReadService: ReviewScheduleReadService,
    private readonly sessionStateReadService: SessionStateReadService,
  ) {}

  /**
   * GET /aim/students/:studentId/skill-states
   *
   * Return all persisted, backend-validated skill states for the student.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via StudentOwnershipGuard.
   *
   * Returns only last-AIM-validated values from student_skill_states. No
   * live AIM Engine call is made. If no states exist, returns an empty array.
   *
   * AIM Engine is never called from this endpoint.
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
  })
  async getSkillStates(
    @Param('studentId') studentId: string,
  ): Promise<StudentSkillStateReadResponse> {
    return this.skillStateReadService.getSkillStatesForStudent(studentId);
  }

  /**
   * GET /aim/students/:studentId/review-schedules
   *
   * Return all persisted, backend-validated review schedules for the student.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via StudentOwnershipGuard.
   *
   * Returns only last-AIM-validated values from review_schedules. No live
   * AIM Engine call is made. If no schedules exist, returns an empty array.
   *
   * AIM Engine is never called from this endpoint.
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
  })
  async getReviewSchedules(
    @Param('studentId') studentId: string,
  ): Promise<ReviewScheduleReadResponse> {
    return this.reviewScheduleReadService.getReviewSchedulesForStudent(studentId);
  }

  /**
   * GET /aim/students/:studentId/sessions/:sessionId/state
   *
   * Return the persisted, backend-validated AIM session summary for the
   * given session — the "current AIM state" for that session.
   *
   * Access is restricted to the owning student (or privileged roles).
   * studentId in the route is validated against the JWT via
   * StudentOwnershipGuard. sessionId is additionally checked against
   * student_id inside the query itself (defense in depth) — a session
   * belonging to another student returns found: false rather than leaking
   * its existence.
   *
   * Returns only the last-AIM-validated summary from session_summaries. No
   * live AIM Engine call is made. If no summary has been persisted yet for
   * this session, returns found: false with all data fields null.
   *
   * AIM Engine is never called from this endpoint.
   */
  @Get('students/:studentId/sessions/:sessionId/state')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Read backend-validated current session AIM state (student).',
    description:
      'Returns the AIM-persisted session summary. No live AIM Engine call. ' +
      'studentId in route validated against JWT; sessionId additionally ' +
      'checked against student_id in the query.',
  })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiParam({ name: 'sessionId', description: 'UUID of the learning session.' })
  @ApiOkResponse({
    description: 'Backend-validated session state. found: false if not yet persisted.',
  })
  async getSessionState(
    @Param('studentId') studentId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<SessionStateReadResponse> {
    return this.sessionStateReadService.getSessionState(studentId, sessionId);
  }
}
