// Admin endpoints for practice topics (operations admins).
//
//   GET    /admin/practice/topics        every topic with all translations + AI prompt
//   POST   /admin/practice/topics        create
//   PATCH  /admin/practice/topics/:id    edit (any field; translations merge per locale)
//   DELETE /admin/practice/topics/:id    delete, or deactivate when students already used it

import { BadRequestException, Injectable, PipeTransform, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { OperationsAdminGuard, OperationsAdminOnly } from '../operations/operations.guards';
import { LOOSE_UUID, PracticeTopicDto } from './practice.dtos';
import { PracticeTopicsService } from './practice-topics.service';
import { AdminPracticeTopicView } from './practice.types';

@Injectable()
class LooseUuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!LOOSE_UUID.test(value)) throw new BadRequestException('id must be a UUID');
    return value;
  }
}

@ApiTags('Admin Practice')
@Controller('admin/practice/topics')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminPracticeController {
  constructor(private readonly topics: PracticeTopicsService) {}

  @Get()
  @OperationsAdminOnly()
  list(): Promise<AdminPracticeTopicView[]> {
    return this.topics.listAll();
  }

  @Post()
  @OperationsAdminOnly()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: PracticeTopicDto): Promise<{ id: string }> {
    return this.topics.create(body);
  }

  @Patch(':id')
  @OperationsAdminOnly()
  async update(@Param('id', LooseUuidPipe) id: string, @Body() body: PracticeTopicDto): Promise<{ ok: true }> {
    await this.topics.update(id, body);
    return { ok: true };
  }

  @Delete(':id')
  @OperationsAdminOnly()
  remove(@Param('id', LooseUuidPipe) id: string): Promise<{ deleted: boolean }> {
    return this.topics.remove(id);
  }
}
