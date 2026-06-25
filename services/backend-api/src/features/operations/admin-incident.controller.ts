import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { IncidentService } from './incident.service';
import { CreateIncidentDto, UpdateIncidentStatusDto } from './operations.dtos';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Incidents')
@Controller('admin/incidents')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminIncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Create an incident (admin)' })
  async createIncident(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentService.createIncident(req.internalUserId!, dto);
  }

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List all incidents (admin)' })
  async listIncidents(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.incidentService.listIncidents(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Patch(':id/status')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Update incident status (admin)' })
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.incidentService.updateStatus(id, req.internalUserId!, dto);
  }
}
