import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { RequirePermissions } from '../../../auth/authorization/required-permissions.decorator';
import { CurriculumPermission } from '../curriculum.permissions';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionInput, UpdateQuestionInput } from './question-bank.types';

@ApiTags('curriculum')
@Controller('curriculum/questions')
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Get()
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'List questions. Requires curriculum.read permission.' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Paginated question list (answer correctness excluded).' })
  async listQuestions(
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.questionBankService.listQuestions(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      type,
      difficulty,
      status,
      q,
    );
  }

  @Get(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_READ_DRAFT)
  @ApiOperation({ summary: 'Get question by ID. Requires curriculum.read permission.' })
  @ApiOkResponse({ description: 'Question detail.' })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  async getQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionBankService.getQuestion(id);
  }

  @Post()
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create question. Requires curriculum.write permission.' })
  @ApiCreatedResponse({ description: 'Question created in draft status.' })
  async createQuestion(
    @Body() body: Omit<CreateQuestionInput, 'createdBy'>,
    @Request() req: { user: { sub: string } },
  ) {
    return this.questionBankService.createQuestion({
      ...body,
      createdBy: req.user.sub,
    });
  }

  @Patch(':id')
  @RequirePermissions(CurriculumPermission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update question. Requires curriculum.write permission.' })
  @ApiOkResponse({ description: 'Question updated.' })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  async updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateQuestionInput,
  ) {
    return this.questionBankService.updateQuestion(id, body);
  }
}
