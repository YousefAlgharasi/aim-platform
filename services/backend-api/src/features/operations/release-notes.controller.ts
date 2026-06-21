import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { ReleaseNotesService } from './release-notes.service';

@ApiTags('Release Notes')
@Controller('release-notes')
@UseGuards(SupabaseJwtAuthGuard)
@ApiBearerAuth()
export class ReleaseNotesController {
  constructor(private readonly releaseNotesService: ReleaseNotesService) {}

  @Get()
  @ApiOperation({ summary: 'List published release notes' })
  async listPublished(@Query('audience') audience?: string) {
    return this.releaseNotesService.getPublished(audience);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a published release note by ID' })
  async getById(@Param('id') id: string) {
    return this.releaseNotesService.getById(id);
  }
}
