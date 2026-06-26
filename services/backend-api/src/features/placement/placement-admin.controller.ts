// Phase 4 — P4-054
// PlacementAdminController.
//
// Scope: Placement Test admin read endpoints only.
//
// Endpoints:
//   GET /admin/placement/tests — paginated list of all placement tests.
//
// Security rules:
//   - Guarded by SupabaseJwtAuthGuard and PlacementPermissionGuard.
//   - Requires AuthorizedRole.ADMIN or AuthorizedRole.SUPER_ADMIN.
//   - Read-only — no placement scoring, CEFR thresholds, or status transitions here.
//   - Status transitions are implemented in P4-058.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
//   - No secrets, service-role keys, or privileged config here.

import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { PlacementPermissionGuard } from './placement-permission.guard';
import {
  PlacementAdminTestReadService,
  AdminPlacementTestListResponse,
} from './placement-admin-test-read.service';

@ApiTags('admin-placement')
@Controller('admin/placement')
@UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
@ApiBearerAuth()
export class PlacementAdminController {
  constructor(private readonly testRead: PlacementAdminTestReadService) {}

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
}
