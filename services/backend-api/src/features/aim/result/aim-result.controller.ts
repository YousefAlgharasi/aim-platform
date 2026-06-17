// Phase 5 — P5-069 + P5-071
// AimResultController.
//
// Scope: Read-only AIM result endpoints. Exposes backend-validated, persisted
//        AIM outputs. Never proxies a live AIM Engine call.
//
// Endpoints:
//   GET /aim/students/:studentId/skill-states      — Read skill states (P5-069).
//   GET /aim/students/:studentId/recommendations   — Read recommendations (P5-071).
//
// Security rules:
//   - All endpoints require a valid Supabase JWT (SupabaseJwtAuthGuard).
//   - StudentOwnershipGuard validates :studentId against the JWT user.
//   - Clients cannot access another student's AIM data.
//   - Read-only. No AIM-owned value may be written through this controller.
//   - This controller never calls the AIM Engine directly.
//   - No secrets, service-role keys, or AI provider keys are exposed here.

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
  RecommendationReadService,
  RecommendationReadResponse,
} from './recommendation-read.service';

@ApiTags(OPENAPI_TAGS.aim)
@Controller('aim')
export class AimResultController {
  constructor(
    private readonly skillStateReadService: StudentSkillStateReadService,
    private readonly recommendationReadService: RecommendationReadService,
  ) {}

  /**
   * GET /aim/students/:studentId/skill-states  (P5-069)
   *
   * Return all persisted, backend-validated skill states for the student.
   * No live AIM Engine call. Empty array if none yet persisted.
   */
  @Get('students/:studentId/skill-states')
  @UseGuards(SupabaseJwtAuthGuard, StudentOwnershipGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @RequireStudentOwnership({ paramName: 'studentId' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read backend-validated student skill states (student).' })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({ description: 'Backend-validated skill states. Empty array if none.' })
  async getSkillStates(
    @Param('studentId') studentId: string,
  ): Promise<StudentSkillStateReadResponse> {
    return this.skillStateReadService.getSkillStatesForStudent(studentId);
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
  @ApiOkResponse({ description: 'Active recommendations ordered by rank. Empty array if none.' })
  async getRecommendations(
    @Param('studentId') studentId: string,
  ): Promise<RecommendationReadResponse> {
    return this.recommendationReadService.getActiveForStudent(studentId);
  }
}
