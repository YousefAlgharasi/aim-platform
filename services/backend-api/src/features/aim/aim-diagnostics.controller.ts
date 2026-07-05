// AimDiagnosticsController.
//
// Scope: Admin-only operational check of backend-api -> aim-engine
// connectivity. Exists to answer one question directly, without needing to
// drive a real lesson/attempt flow end-to-end: "is aim-engine reachable and
// is the shared service token accepted?"
//
// Security rules:
//   - Admin/super-admin only (SupabaseJwtAuthGuard + RoleGuard).
//   - Calls AimEngineClientService.checkHealth() — GET /health only. Never
//     sends a real analysis payload, never exposes the service token.
//   - This is the ONLY caller of checkHealth() today; it exists purely for
//     this diagnostic and is not on any student-facing path.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { AimEngineClientService } from './aim-engine-client.service';
import { AimEngineClientHealthResult } from './aim-engine-client.types';

@ApiTags(OPENAPI_TAGS.aim)
@Controller('aim/diagnostics')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AimDiagnosticsController {
  constructor(private readonly aimEngineClient: AimEngineClientService) {}

  /**
   * GET /aim/diagnostics/engine-health
   *
   * Calls aim-engine's GET /health directly (no service token required by
   * that route) and reports whether the configured AIM_ENGINE_URL is
   * reachable and returning a healthy status. reachable: false with no
   * health payload means the URL is wrong, aim-engine is down, or it never
   * redeployed. This does not verify AIM_ENGINE_SERVICE_TOKEN — that is
   * only checked on POST /aim/v1/analysis (the real attempt-submission
   * path), never here.
   */
  @Get('engine-health')
  @ApiOperation({
    summary: 'Check backend-api -> aim-engine connectivity (admin).',
    description:
      'Calls GET /health on the configured AIM_ENGINE_URL directly. ' +
      'reachable: false means the URL is unreachable, misconfigured, or ' +
      'aim-engine has not been (re)deployed.',
  })
  @ApiOkResponse({ description: 'Raw reachability result from the AIM Engine health check.' })
  async getEngineHealth(): Promise<AimEngineClientHealthResult> {
    return this.aimEngineClient.checkHealth();
  }
}
