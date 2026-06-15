import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { CurriculumAuditLogService } from './curriculum-audit-log.service';

@ApiTags('curriculum-audit')
@Controller('curriculum/audit-logs')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class CurriculumAuditLogController {
  constructor(private readonly auditLogService: CurriculumAuditLogService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.AUDIT_READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List curriculum audit logs. Requires curriculum.audit.read permission.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  @ApiQuery({ name: 'actorUserId', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated audit log entries.' })
  async listLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('eventType') eventType?: string,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.auditLogService.listLogs(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 50,
      entityType,
      entityId,
      eventType,
      actorUserId,
    );
  }
}
