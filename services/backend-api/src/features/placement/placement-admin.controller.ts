// Phase 4 — P4-054 / P19-004
// PlacementAdminController.
//
// Scope: Placement Test admin endpoints — read (P4-054) and write (P19-004).
//
// Endpoints:
//   GET    /admin/placement/tests                              — paginated list of all placement tests.
//   POST   /admin/placement/tests                               — create a draft test.
//   PATCH  /admin/placement/tests/:id                           — update test metadata.
//   DELETE /admin/placement/tests/:id                           — delete a draft test (no attempts).
//   POST   /admin/placement/tests/:id/publish                   — draft -> published.
//   POST   /admin/placement/tests/:id/archive                   — published -> archived.
//   POST   /admin/placement/tests/:testId/sections               — add a section.
//   PATCH  /admin/placement/sections/:id                         — update section metadata.
//   DELETE /admin/placement/sections/:id                         — remove a section (no answers).
//   POST   /admin/placement/sections/:sectionId/questions        — add a question.
//   PATCH  /admin/placement/questions/:id                        — update question text/options.
//   DELETE /admin/placement/questions/:id                        — remove a question (no answers).
//   POST   /admin/placement/questions/:questionId/skills          — link a skill to a question.
//   DELETE /admin/placement/questions/:questionId/skills/:skillId — unlink a skill.
//   GET    /admin/placement/analytics                             — aggregate analytics summary (P19-008).
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard and RoleGuard — admin roles are assigned via
//     the DB roles table (RolesService), not JWT app_metadata, so this controller
//     uses the same RoleGuard as the other admin/* controllers rather than
//     PlacementPermissionGuard (which only checks JWT app_metadata roles and is
//     reserved for the student-facing placement endpoints).
//   - Requires AuthorizedRole.ADMIN or AuthorizedRole.SUPER_ADMIN.
//   - Backend is the sole authority for status transitions, total_sections,
//     total_questions, and all timestamps — clients never write these directly.
//   - No placement scoring, CEFR thresholds, or skill map computation here.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
//   - No secrets, service-role keys, or privileged config here.

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import {
  PlacementAdminTestReadService,
  AdminPlacementTestListResponse,
} from './placement-admin-test-read.service';
import {
  AdminPlacementQuestion,
  AdminPlacementQuestionSkillLink,
  AdminPlacementSection,
  AdminPlacementTest,
  PlacementAdminWriteService,
} from './placement-admin-write.service';
import {
  AddPlacementQuestionSkillDto,
  CreatePlacementQuestionDto,
  CreatePlacementSectionDto,
  CreatePlacementTestDto,
  UpdatePlacementQuestionDto,
  UpdatePlacementSectionDto,
  UpdatePlacementTestDto,
} from './placement-admin-write.dto';
import { PlacementAnalyticsService, PlacementAnalyticsSummary } from './placement-analytics.service';

@ApiTags('admin-placement')
@Controller('admin/placement')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
@ApiBearerAuth()
export class PlacementAdminController {
  constructor(
    private readonly testRead: PlacementAdminTestReadService,
    private readonly write: PlacementAdminWriteService,
    private readonly analytics: PlacementAnalyticsService,
  ) {}

  /**
   * GET /admin/placement/analytics
   * Aggregate completion rate, band distribution, per-section accuracy,
   * and drop-off count across all placement attempts (P19-008).
   */
  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get aggregate placement analytics (admin-only).' })
  @ApiOkResponse({ description: 'Completion rate, band distribution, section accuracy, drop-off count.' })
  async getAnalytics(): Promise<PlacementAnalyticsSummary> {
    return this.analytics.getSummary();
  }

  /**
   * GET /admin/placement/tests
   * Paginated list of all placement tests for admin inspection.
   */
  @Get('tests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all placement tests (admin, read-only).' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Paginated placement test list. version and published_at excluded.' })
  async listTests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<AdminPlacementTestListResponse> {
    return this.testRead.listTests(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // ---------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------

  @Post('tests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new placement test (draft status).' })
  async createTest(@Body() dto: CreatePlacementTestDto): Promise<AdminPlacementTest> {
    return this.write.createTest(dto);
  }

  @Patch('tests/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update placement test metadata.' })
  async updateTest(
    @Param('id') id: string,
    @Body() dto: UpdatePlacementTestDto,
  ): Promise<AdminPlacementTest> {
    return this.write.updateTest(id, dto);
  }

  @Delete('tests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft placement test (only if no attempts exist).' })
  async deleteTest(@Param('id') id: string): Promise<void> {
    await this.write.deleteTest(id);
  }

  @Post('tests/:id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a draft placement test (draft -> published).' })
  async publishTest(@Param('id') id: string): Promise<AdminPlacementTest> {
    return this.write.publishTest(id);
  }

  @Post('tests/:id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a published placement test (published -> archived).' })
  async archiveTest(@Param('id') id: string): Promise<AdminPlacementTest> {
    return this.write.archiveTest(id);
  }

  // ---------------------------------------------------------------------
  // Sections
  // ---------------------------------------------------------------------

  @Post('tests/:testId/sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a section to a placement test.' })
  async createSection(
    @Param('testId') testId: string,
    @Body() dto: CreatePlacementSectionDto,
  ): Promise<AdminPlacementSection> {
    return this.write.createSection(testId, dto);
  }

  @Patch('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update placement section metadata.' })
  async updateSection(
    @Param('id') id: string,
    @Body() dto: UpdatePlacementSectionDto,
  ): Promise<AdminPlacementSection> {
    return this.write.updateSection(id, dto);
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a placement section (only if no answers exist).' })
  async deleteSection(@Param('id') id: string): Promise<void> {
    await this.write.deleteSection(id);
  }

  // ---------------------------------------------------------------------
  // Questions
  // ---------------------------------------------------------------------

  @Post('sections/:sectionId/questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a question to a placement section.' })
  async createQuestion(
    @Param('sectionId') sectionId: string,
    @Body() dto: CreatePlacementQuestionDto,
  ): Promise<AdminPlacementQuestion> {
    return this.write.createQuestion(sectionId, dto);
  }

  @Patch('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update placement question text/options.' })
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdatePlacementQuestionDto,
  ): Promise<AdminPlacementQuestion> {
    return this.write.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a placement question (only if no answers exist).' })
  async deleteQuestion(@Param('id') id: string): Promise<void> {
    await this.write.deleteQuestion(id);
  }

  // ---------------------------------------------------------------------
  // Question-skill links
  // ---------------------------------------------------------------------

  @Post('questions/:questionId/skills')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a skill to a placement question.' })
  async addQuestionSkill(
    @Param('questionId') questionId: string,
    @Body() dto: AddPlacementQuestionSkillDto,
  ): Promise<AdminPlacementQuestionSkillLink> {
    return this.write.addQuestionSkillLink(questionId, dto);
  }

  @Delete('questions/:questionId/skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a skill from a placement question.' })
  async removeQuestionSkill(
    @Param('questionId') questionId: string,
    @Param('skillId') skillId: string,
  ): Promise<void> {
    await this.write.removeQuestionSkillLink(questionId, skillId);
  }
}
