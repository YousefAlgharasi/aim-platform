import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
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
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.submitFeedback(req.internalUserId!, dto);
  }

  @Get('mine')
  @OperationsResource('feedback')
  @ApiOperation({ summary: 'List my feedback submissions' })
  async getMyFeedback(@Req() req: AuthenticatedRequest) {
    return this.feedbackService.getMyFeedback(req.internalUserId!);
  }
}
