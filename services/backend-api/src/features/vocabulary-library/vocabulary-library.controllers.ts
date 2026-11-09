import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { ResolveInternalUserIdGuard } from '../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../auth/current-user.decorator';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OperationsAdminGuard, OperationsAdminOnly } from '../operations/operations.guards';
import { TtsAudioStorageService } from '../voice-teacher/tts-gateway/tts-audio-storage.service';
import { TtsAudioDeliveryService } from '../voice-teacher/tts-gateway/persistent/tts-audio-delivery.service';
import { VocabularyLibraryService } from './vocabulary-library.service';

@ApiTags('Vocabulary library')
@Controller('vocabulary-library')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class VocabularyLibraryController {
  constructor(
    private readonly library: VocabularyLibraryService,
    private readonly audioStorage: TtsAudioStorageService,
    private readonly audioDelivery: TtsAudioDeliveryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Browse the vocabulary library (filter by level, search by word or Arabic). Each word says whether it is saved.' })
  list(@ResolvedInternalUserId() id: string, @Query() q: { level?: string; q?: string; limit?: string; offset?: string }) {
    return this.library.list(id, q);
  }

  @Post(':id/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save a library word to My words.' })
  save(@ResolvedInternalUserId() sid: string, @Param('id', ParseUUIDPipe) id: string) { return this.library.save(sid, id); }

  @Delete(':id/save')
  @ApiOperation({ summary: 'Remove a library word from My words.' })
  unsave(@ResolvedInternalUserId() sid: string, @Param('id', ParseUUIDPipe) id: string) { return this.library.unsave(sid, id); }

  @Get(':id/audio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Spoken pronunciation of the word (audio stream).' })
  async audio(
    @ResolvedInternalUserId() sid: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
    @Headers('accept') accept: string | undefined,
  ): Promise<void> {
    const ref = await this.library.audioRef(sid, id);
    if (!ref) { res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not available' }); return; }
    const audio = await this.audioStorage.retrieveAudio(ref, sid);
    if (!audio) { res.status(HttpStatus.NOT_FOUND).json({ error: 'Audio not found' }); return; }
    await this.audioDelivery.send(res, audio, accept);
  }
}

@ApiTags('Admin Vocabulary')
@Controller('admin/vocabulary-library')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminVocabularyLibraryController {
  constructor(private readonly library: VocabularyLibraryService) {}

  @Get()
  @OperationsAdminOnly()
  list(@Query() q: { level?: string; q?: string; limit?: string; offset?: string }) { return this.library.adminList(q); }

  @Post()
  @OperationsAdminOnly()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: Record<string, unknown>) { return this.library.create(body ?? {}); }

  @Patch(':id')
  @OperationsAdminOnly()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) { return this.library.update(id, body ?? {}); }

  @Delete(':id')
  @OperationsAdminOnly()
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.library.remove(id); }
}
