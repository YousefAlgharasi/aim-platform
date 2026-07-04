import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AppError } from '../../../../common/errors/app-error';
import { AiChatSessionRepository } from '../../../ai-teacher/repositories/ai-chat-session.repository';
import { UsersService } from '../../../users/users.service';

interface VoiceSessionRequest {
  readonly user?: { id: string };
  readonly params?: Record<string, string | undefined>;
}

/**
 * P21-007/P21-010: voice sessions are now `ai_chat_sessions` rows (created
 * via VoiceSessionStartService -> ChatSessionStartService's get-or-create
 * path), not `voice_sessions` rows — this guard's ownership check must look
 * up the same table the session was actually created in, or every voice
 * turn submitted against a post-P21-007 session would 403 as "not found".
 *
 * Bugfix: `ai_chat_sessions.student_id` stores the internal `users.id`
 * (resolved via ResolveInternalUserIdGuard when the session was created),
 * never the raw Supabase Auth UID found in `request.user.id`. Comparing
 * `session.student_id !== request.user.id` directly compared two different
 * id spaces and rejected every real student's own session as "not
 * theirs" — resolve the same internal id here before comparing.
 */
@Injectable()
export class VoiceSessionOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(VoiceSessionOwnershipGuard.name);

  constructor(
    private readonly chatSessionRepository: AiChatSessionRepository,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<VoiceSessionRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const sessionId = request.params?.sessionId;
    if (!sessionId) {
      return true;
    }

    const internalUser = await this.usersService.findBySupabaseUid(user.id);

    if (!internalUser) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user has no internal AIM account.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const session = await this.chatSessionRepository.findById(sessionId);

    if (!session) {
      this.logger.warn(
        `VoiceSessionOwnershipGuard: session not found sessionId=${sessionId} userId=${internalUser.id}`,
      );
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Voice session not found',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (session.student_id !== internalUser.id) {
      this.logger.warn(
        `VoiceSessionOwnershipGuard: ownership denied userId=${internalUser.id} sessionId=${sessionId}`,
      );
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Access denied: you do not own this voice session',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    this.logger.debug(
      `VoiceSessionOwnershipGuard: ownership confirmed userId=${internalUser.id} sessionId=${sessionId}`,
    );

    return true;
  }
}
