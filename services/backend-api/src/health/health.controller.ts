import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { OPENAPI_TAGS } from '../openapi/openapi.tags';
import { BackendConfigService } from '../config/backend-config.service';
import { DatabaseService } from '../database/database.service';
import { HealthResponse, VersionResponse } from './health.types';
import { HealthService } from './health.service';

const EXPECTED_TABLES = [
  'users',
  'student_profiles',
  'admin_profiles',
  'auth_audit_logs',
  'analytics_events',
] as const;

@SkipThrottle()
@ApiTags(OPENAPI_TAGS.foundation)
@Controller()
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly backendConfig: BackendConfigService,
    private readonly db: DatabaseService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Return backend health metadata.' })
  @ApiOkResponse({ description: 'Backend health metadata.' })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: 'Return backend version metadata.' })
  @ApiOkResponse({ description: 'Backend version metadata.' })
  getVersion(): VersionResponse {
    return this.healthService.getVersion();
  }

  // Temporary diagnostic endpoint — reports which expected tables exist in
  // the connected database. Remove once the bootstrap schema issue is resolved.
  @Get('health/db-tables')
  async getDbTables(
    @Headers('x-diagnostic-key') diagnosticKey?: string,
  ): Promise<{ readonly tables: Record<string, boolean> }> {
    if (diagnosticKey !== this.backendConfig.supabase.serviceRoleKey) {
      throw new ForbiddenException();
    }

    const result = await this.db.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [EXPECTED_TABLES],
    );

    const found = new Set(result.rows.map((row) => row.table_name));
    const tables = Object.fromEntries(
      EXPECTED_TABLES.map((table) => [table, found.has(table)]),
    );

    return { tables };
  }
}
