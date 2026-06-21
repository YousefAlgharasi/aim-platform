import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
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
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentService.createIncident(user.id, dto);
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
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.incidentService.updateStatus(id, user.id, dto);
  }
}
