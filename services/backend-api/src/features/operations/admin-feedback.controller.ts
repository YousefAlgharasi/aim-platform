import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
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
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.feedbackService.adminTriageFeedback(id, status, req.internalUserId!);
  }
}
