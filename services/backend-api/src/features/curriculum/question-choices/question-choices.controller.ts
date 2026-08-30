import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { QuestionChoicesService } from './question-choices.service';

@ApiTags('curriculum')
@Controller('curriculum/questions/:questionId/choices')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class QuestionChoicesController {
  constructor(private readonly questionChoicesService: QuestionChoicesService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List answer choices for a question. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Question answer choices, including is_correct (admin-only).' })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  async listChoices(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return this.questionChoicesService.listChoices(questionId);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an answer choice to a question. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Choice created.' })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  @ApiForbiddenResponse({ description: 'Question is not in draft status.' })
  async createChoice(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.questionChoicesService.createChoice(questionId, body);
  }

  @Put('reorder')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({
    summary:
      'Reorder all answer choices for a question. Requires curriculum.write permission.',
  })
  @ApiOkResponse({ description: 'Choices reordered.' })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  @ApiForbiddenResponse({ description: 'Question is not in draft status.' })
  async reorderChoices(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body('orderedChoiceIds') orderedChoiceIds: unknown,
  ) {
    return this.questionChoicesService.reorderChoices(questionId, orderedChoiceIds);
  }

  @Patch(':choiceId')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update an answer choice. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Choice updated.' })
  @ApiNotFoundResponse({ description: 'Question or choice not found.' })
  @ApiForbiddenResponse({ description: 'Question is not in draft status.' })
  async updateChoice(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Param('choiceId', ParseUUIDPipe) choiceId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.questionChoicesService.updateChoice(questionId, choiceId, body);
  }

  @Delete(':choiceId')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an answer choice from a question. Requires curriculum.write permission.' })
  @ApiNoContentResponse({ description: 'Choice removed.' })
  @ApiNotFoundResponse({ description: 'Question or choice not found.' })
  @ApiForbiddenResponse({ description: 'Question is not in draft status.' })
  async deleteChoice(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Param('choiceId', ParseUUIDPipe) choiceId: string,
  ) {
    await this.questionChoicesService.deleteChoice(questionId, choiceId);
  }
}
