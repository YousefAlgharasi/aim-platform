// P18-051: Create Admin AI Safety Review API
//
// Endpoints (admin/super_admin only):
//   GET /admin/ai/safety/events    — List recent rejected safety events (any session).
//   GET /admin/ai/safety/feedback  — List recent flagged ('not_helpful') feedback.
//
// Security rules:
//   - Requires a valid Supabase JWT (SupabaseJwtAuthGuard) and ADMIN/
//     SUPER_ADMIN role (RoleGuard), same pattern as AdminPromptController.
//   - Read-only. Never exposes the rejected raw message/response content —
//     only the recorded decision/reason_category, exactly as stored.
//   - Computes no mastery/level/weakness/difficulty/recommendation/
//     review-schedule value.

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';

import { AiSafetyEventRepository } from '../repositories/ai-safety-event.repository';
import { AiTeacherFeedbackRepository } from '../repositories/ai-teacher-feedback.repository';
import { AiSafetyEventRow, AiTeacherFeedbackRow } from '../repositories/ai-chat-repository.types';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

function parseLimit(raw: unknown): number {
  const parsed = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/ai/safety')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminSafetyReviewController {
  constructor(
    private readonly safetyEventRepository: AiSafetyEventRepository,
    private readonly feedbackRepository: AiTeacherFeedbackRepository,
  ) {}

  @Get('events')
  @ApiOperation({ summary: 'List recent rejected AI safety events. Admin only.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max rows to return (default 100, max 500).' })
  @ApiOkResponse({ description: 'Recent rejected safety event rows.' })
  async listRejectedEvents(@Query('limit') limit?: string): Promise<AiSafetyEventRow[]> {
    return this.safetyEventRepository.listRecentRejected(parseLimit(limit));
  }

  @Get('feedback')
  @ApiOperation({ summary: "List recent flagged ('not_helpful') AI Teacher feedback. Admin only." })
  @ApiQuery({ name: 'limit', required: false, description: 'Max rows to return (default 100, max 500).' })
  @ApiOkResponse({ description: 'Recent flagged feedback rows.' })
  async listFlaggedFeedback(@Query('limit') limit?: string): Promise<AiTeacherFeedbackRow[]> {
    return this.feedbackRepository.listRecentNotHelpful(parseLimit(limit));
  }
}
