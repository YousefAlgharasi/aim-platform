// AdminStudentProgressController.
//
// Scope: Admin read-only per-student lesson progress endpoints only.
//
// Endpoints:
//   GET /admin/students/:id/progress — Progress summary for one student.
//   GET /admin/students/:id/lessons  — Paginated per-lesson completion list.
//   GET /admin/students/:id/profile  — Full profile: placement, course
//                                       history (with assessments and any
//                                       certificate), weaknesses,
//                                       subscription, AI Teacher activity.
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard and RoleGuard — admin roles are
//     assigned via the DB roles table, consistent with AdminUsersController.
//   - Requires AuthorizedRole.ADMIN or AuthorizedRole.SUPER_ADMIN.
//   - Read-only — no writes to lesson_progress here.

import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AdminStudentProgressService } from './admin-student-progress.service';
import {
  StudentLessonProgressListResponse,
  StudentProgressSummary,
} from '../../lessons/lesson-progress.types';
import { AdminStudentProfileService, AdminStudentProfile } from './admin-student-profile.service';
import { StudentSkillStateReadService } from '../../aim/result/student-skill-state-read.service';
import { WeaknessRecordsReadService } from '../../aim/result/weakness-records-read.service';
import { RecommendationReadService } from '../../aim/result/recommendation-read.service';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/students')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminStudentProgressController {
  constructor(
    private readonly studentProgress: AdminStudentProgressService,
    private readonly studentProfile: AdminStudentProfileService,
    private readonly skillStateRead: StudentSkillStateReadService,
    private readonly weaknessRecordsRead: WeaknessRecordsReadService,
    private readonly recommendationRead: RecommendationReadService,
  ) {}

  @Get(':id/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the full admin profile for a student: placement, course history, assessments, certificates, weaknesses, subscription, AI Teacher activity (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiOkResponse({ description: 'Aggregated student profile. Every value is backend-computed elsewhere; this endpoint only assembles them.' })
  async getFullProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AdminStudentProfile> {
    return this.studentProfile.getProfile(id);
  }

  @Get(':id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get backend-computed lesson progress summary for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiOkResponse({ description: 'Progress summary. completionPct is backend-computed, never recalculated by the client.' })
  async getProgress(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StudentProgressSummary> {
    return this.studentProgress.getProgressSummary(id);
  }

  @Get(':id/skill-states')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List backend-persisted skill mastery states for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiOkResponse({ description: 'Skill states, wrapped in a data envelope. masteryLevel/state are backend-computed.' })
  async getSkillStates(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ data: Array<{ skillId: string; skillKey: string; masteryLevel: number; state: string; lastUpdatedAt: string }> }> {
    const { skillStates } = await this.skillStateRead.getSkillStatesForStudent(id);
    return {
      data: skillStates.map((s) => ({
        skillId: s.skillId,
        skillKey: s.skillId,
        masteryLevel: Math.round(s.masteryScore),
        state:
          s.masteryScore >= 85 ? 'mastered' : s.masteryScore >= 50 ? 'learning' : 'struggling',
        lastUpdatedAt: s.updatedAt,
      })),
    };
  }

  @Get(':id/weaknesses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List backend-persisted weakness records for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiOkResponse({ description: 'Weakness records, wrapped in a data envelope. severity is backend-computed.' })
  async getWeaknesses(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ data: Array<{ skillId: string; skillKey: string; severity: string; detectedAt: string }> }> {
    const { weaknessRecords } = await this.weaknessRecordsRead.getWeaknessRecordsForStudent(id);
    return {
      data: weaknessRecords.map((w) => ({
        skillId: w.skillId,
        skillKey: w.skillId,
        severity: w.severity,
        detectedAt: w.detectedAt,
      })),
    };
  }

  @Get(':id/recommendations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List active AIM recommendations for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiOkResponse({ description: 'Active recommendations, wrapped in a data envelope. reason is an AIM Engine output.' })
  async getRecommendations(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ data: Array<{ type: string; entityId: string; reason: string; generatedAt: string }> }> {
    const { recommendations } = await this.recommendationRead.getActiveForStudent(id);
    return {
      data: recommendations.map((r) => ({
        type: r.kind,
        entityId: r.targetLessonId ?? r.targetSkillId,
        reason: r.reason,
        generatedAt: r.generatedAt,
      })),
    };
  }

  @Get(':id/lessons')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List per-lesson completion status for a student (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Internal AIM user UUID of the student.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Paginated per-lesson completion list.' })
  async getLessons(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<StudentLessonProgressListResponse> {
    return this.studentProgress.getLessonProgressList(
      id,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }
}
