import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { MaintenanceWindowService } from './maintenance-window.service';

@ApiTags('Maintenance Windows')
@Controller('maintenance-windows')
@UseGuards(SupabaseJwtAuthGuard)
@ApiBearerAuth()
export class MaintenanceWindowController {
  constructor(
    private readonly maintenanceWindowService: MaintenanceWindowService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active and upcoming maintenance windows' })
  async getActiveWindows() {
    return this.maintenanceWindowService.getActiveMaintenanceWindows();
  }
}
