// P18-078: Create Admin AI Audit UI (backend support)
//
// Endpoint (admin/super_admin only):
//   GET /admin/ai/audit/logs — List recent AI Teacher audit log rows.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard) and ADMIN/
//     SUPER_ADMIN role (RoleGuard), same pattern as AdminSafetyReviewController.
//   - Read-only. `details` is the safe metadata JSON recorded by
//     AiTeacherAuditService at write time (P18-039) — never raw provider
//     payloads, secrets, or API keys.

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { AiTeacherAuditLogRepository } from '../governance/ai-teacher-audit-log.repository';
import { AiTeacherAuditLogRow } from '../governance/governance-repository.types';

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
@Controller('admin/ai/audit')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminAuditController {
  constructor(private readonly auditLogRepository: AiTeacherAuditLogRepository) {}

  @Get('logs')
  @ApiOperation({ summary: 'List recent AI Teacher audit log rows. Admin only.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max rows to return (default 100, max 500).' })
  @ApiOkResponse({ description: 'Recent audit log rows.' })
  async listRecentLogs(@Query('limit') limit?: string): Promise<AiTeacherAuditLogRow[]> {
    return this.auditLogRepository.listRecent(parseLimit(limit));
  }
}
