import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { FeedbackService } from './feedback.service';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Feedback')
@Controller('admin/feedback')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List all feedback (admin)' })
  async listAllFeedback() {
    return this.feedbackService.adminGetAllFeedback();
  }

  @Patch(':id/status')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Triage feedback status (admin)' })
  async triageFeedback(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.feedbackService.adminTriageFeedback(id, status, user.id);
  }
}
