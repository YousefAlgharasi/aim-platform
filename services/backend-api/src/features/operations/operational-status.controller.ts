import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { OperationalStatusService } from './operational-status.service';

@ApiTags('Operational Status')
@Controller('operational-status')
@UseGuards(SupabaseJwtAuthGuard)
@ApiBearerAuth()
export class OperationalStatusController {
  constructor(
    private readonly operationalStatusService: OperationalStatusService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all component statuses' })
  async getAll() {
    return this.operationalStatusService.getStatus();
  }
}
