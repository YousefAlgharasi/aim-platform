import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './operations.dtos';
import { OperationsOwnershipGuard, OperationsResource } from './operations.guards';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(SupabaseJwtAuthGuard, OperationsOwnershipGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsResource('feedback')
  @ApiOperation({ summary: 'Submit user feedback' })
  async submitFeedback(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.submitFeedback(user.id, dto);
  }

  @Get('mine')
  @OperationsResource('feedback')
  @ApiOperation({ summary: 'List my feedback submissions' })
  async getMyFeedback(@CurrentUser() user: AuthenticatedUser) {
    return this.feedbackService.getMyFeedback(user.id);
  }
}
