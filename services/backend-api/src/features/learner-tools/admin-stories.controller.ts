// Admin endpoints for course stories (operations admins).
//
//   GET    /admin/stories              every story (any status) + the courses that have none yet
//   GET    /admin/stories/:id          one story with all its scenes, lines and questions (with the right answers)
//   POST   /admin/stories              create a story for a course
//   PUT    /admin/stories/:id          save: replaces the whole content, keeping the ids of edited scenes and questions
//   PATCH  /admin/stories/:id/status   draft | published | archived
//   DELETE /admin/stories/:id          delete the story with its scenes and questions

import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Injectable, Param, Patch, PipeTransform, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { OperationsAdminGuard, OperationsAdminOnly } from '../operations/operations.guards';
import { AdminStoriesService } from './admin-stories.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
class StoryIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!UUID.test(value)) throw new BadRequestException('id must be a UUID');
    return value;
  }
}

@ApiTags('Admin Stories')
@Controller('admin/stories')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminStoriesController {
  constructor(private readonly stories: AdminStoriesService) {}

  @Get()
  @OperationsAdminOnly()
  list() { return this.stories.list(); }

  @Get(':id')
  @OperationsAdminOnly()
  get(@Param('id', StoryIdPipe) id: string) { return this.stories.get(id); }

  @Post()
  @OperationsAdminOnly()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser('id') adminId: string, @Body() body: unknown) { return this.stories.create(adminId, body); }

  @Put(':id')
  @OperationsAdminOnly()
  save(@CurrentUser('id') adminId: string, @Param('id', StoryIdPipe) id: string, @Body() body: unknown) { return this.stories.save(adminId, id, body); }

  @Patch(':id/status')
  @OperationsAdminOnly()
  status(@Param('id', StoryIdPipe) id: string, @Body() body: { status?: unknown }) { return this.stories.setStatus(id, body?.status); }

  @Delete(':id')
  @OperationsAdminOnly()
  remove(@Param('id', StoryIdPipe) id: string) { return this.stories.remove(id); }
}
