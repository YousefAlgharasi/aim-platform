import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { CourseTranslationsService } from './course-translations.service';
import { UpsertCourseTranslationInput } from './course-translations.types';

@ApiTags('curriculum')
@Controller('curriculum/courses/:id/translations')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class CourseTranslationsController {
  constructor(private readonly translations: CourseTranslationsService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List every translation of a course. Requires curriculum.content.read.draft.' })
  @ApiOkResponse({ description: 'All translations plus supported and missing locales.' })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async listTranslations(@Param('id', ParseUUIDPipe) id: string) {
    return this.translations.listTranslations(id);
  }

  @Put(':locale')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Create or replace one translation. Requires curriculum.content.update.' })
  @ApiOkResponse({ description: 'The saved translation.' })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async upsertTranslation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('locale') locale: string,
    @Body() body: UpsertCourseTranslationInput,
  ) {
    return this.translations.upsertTranslation(id, locale, body);
  }

  @Delete(':locale')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Delete a non-English translation. Requires curriculum.content.update.' })
  @ApiOkResponse({ description: 'Translation deleted. The English translation cannot be deleted.' })
  @ApiNotFoundResponse({ description: 'Course or translation not found.' })
  async deleteTranslation(@Param('id', ParseUUIDPipe) id: string, @Param('locale') locale: string) {
    return this.translations.deleteTranslation(id, locale);
  }
}
