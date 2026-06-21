import {
  Controller,
  Post,
  Get,
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
import { ReleaseNotesService } from './release-notes.service';
import { CreateReleaseNoteDto } from './operations.dtos';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Release Notes')
@Controller('admin/release-notes')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminReleaseNotesController {
  constructor(private readonly releaseNotesService: ReleaseNotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Create a release note draft (admin)' })
  async createDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReleaseNoteDto,
  ) {
    return this.releaseNotesService.createDraft(
      {
        title: dto.title,
        body: dto.body,
        version: dto.version,
        audience: dto.audience,
      },
      user.id,
    );
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Publish a release note (admin)' })
  async publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.releaseNotesService.publish(id, user.id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Archive a release note (admin)' })
  async archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.releaseNotesService.archive(id, user.id);
  }

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List all release notes including drafts (admin)' })
  async listAll(@CurrentUser() user: AuthenticatedUser) {
    return this.releaseNotesService.getDrafts(user.id);
  }
}
