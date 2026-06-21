/**
 * P8-076: Add AI Teacher API Guards (Group H — AI Teacher API Endpoints).
 * Reusable NestJS guard that enforces session ownership: the authenticated
 * student (from JWT) must own the session identified by the `id` route
 * param. If the session does not exist or belongs to a different student,
 * a 404 Not Found is returned — no existence leak.
 *
 * Usage:
 *   @UseGuards(SupabaseJwtAuthGuard, RoleGuard, AiTeacherSessionOwnershipGuard)
 *   @Param('id') sessionId: string
 *
 * This guard performs no AI provider call and computes no mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md). It does not read or expose
 * any AI provider secret (docs/phase-8/no-client-ai-provider-rule.md).
 */
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';
import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';

interface SessionOwnershipRequest extends AuthenticatedRequest {
  readonly params?: Record<string, string | undefined>;
  /** Attached by this guard so downstream handlers can use the loaded session. */
  aiChatSession?: Awaited<ReturnType<AiChatSessionRepository['findById']>>;
}

@Injectable()
export class AiTeacherSessionOwnershipGuard implements CanActivate {
  constructor(private readonly chatSessionRepository: AiChatSessionRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionOwnershipRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const sessionId = request.params?.['id']?.trim();

    if (!sessionId) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Chat session not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const session = await this.chatSessionRepository.findById(sessionId);

    if (!session || session.student_id !== user.id) {
      // Return 404 in both cases: no existence leak.
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Chat session not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Attach so downstream controller handlers can read it without re-querying.
    (request as SessionOwnershipRequest & { aiChatSession: typeof session }).aiChatSession = session;

    return true;
  }
}
