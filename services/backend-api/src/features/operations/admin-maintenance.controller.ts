import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { MaintenanceWindowService } from './maintenance-window.service';
import { CreateMaintenanceWindowDto, UpdateMaintenanceStatusDto } from './operations.dtos';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Maintenance Windows')
@Controller('admin/maintenance-windows')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminMaintenanceController {
  constructor(
    private readonly maintenanceWindowService: MaintenanceWindowService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Create a maintenance window (admin)' })
  async createWindow(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMaintenanceWindowDto,
  ) {
    return this.maintenanceWindowService.createWindow(
      {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        affectedServices: dto.affectedServices,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: new Date(dto.scheduledEnd),
        userMessage: dto.userMessage,
      },
      user.id,
    );
  }

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List all maintenance windows (admin)' })
  async listWindows() {
    return this.maintenanceWindowService.getWindows();
  }

  @Patch(':id/status')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Update maintenance window status (admin)' })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenanceWindowService.updateWindowStatus(
      id,
      { status: dto.status },
      user.id,
    );
  }
}
