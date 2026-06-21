// P18-050: Create Admin AI Usage and Cost API
//
// Endpoints (admin/super_admin only):
//   GET /admin/ai/usage                       — List recent usage/cost events (any student).
//   GET /admin/ai/usage/student/:studentId    — List usage/cost events for one student.
//   GET /admin/ai/usage/student/:studentId/limit-status — Daily/monthly quota status for one student.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard) and ADMIN/
//     SUPER_ADMIN role (RoleGuard), same pattern as AdminPromptController.
//   - Read-only: never writes usage/cost rows here — those are written only
//     by the live provider-call pipeline after a quota check has passed.
//   - Computes no mastery/level/weakness/difficulty/recommendation/
//     review-schedule value.

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { AiCostQuotaService } from '../governance/ai-cost-quota.service';
import { AiUsageCostEventRow } from '../governance/governance-repository.types';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

function parseLimit(raw: unknown): number {
  const parsed = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/ai/usage')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminUsageCostController {
  constructor(private readonly costQuotaService: AiCostQuotaService) {}

  @Get()
  @ApiOperation({ summary: 'List recent AI usage/cost events across all students. Admin only.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max rows to return (default 100, max 500).' })
  @ApiOkResponse({ description: 'Recent usage/cost event rows.' })
  async listRecent(@Query('limit') limit?: string): Promise<AiUsageCostEventRow[]> {
    return this.costQuotaService.listRecentUsage(parseLimit(limit));
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'List AI usage/cost events for one student. Admin only.' })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max rows to return (default 100, max 500).' })
  @ApiOkResponse({ description: 'Usage/cost event rows for the student.' })
  async listForStudent(
    @Param('studentId') studentId: string,
    @Query('limit') limit?: string,
  ): Promise<AiUsageCostEventRow[]> {
    return this.costQuotaService.listUsageForStudent(studentId, parseLimit(limit));
  }

  @Get('student/:studentId/limit-status')
  @ApiOperation({ summary: 'Daily/monthly quota status for one student. Admin only.' })
  @ApiParam({ name: 'studentId', description: 'UUID of the student.' })
  @ApiOkResponse({ description: 'Daily and monthly quota status for the student.' })
  async getLimitStatus(@Param('studentId') studentId: string) {
    return this.costQuotaService.getLimitStatusForStudent(studentId);
  }
}
