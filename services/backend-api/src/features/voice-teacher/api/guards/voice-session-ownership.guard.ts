import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AppError } from '../../../../common/errors/app-error';
import { VoiceSessionRepository } from '../../repositories/voice-session.repository';

interface VoiceSessionRequest {
  readonly user?: { id: string };
  readonly params?: Record<string, string | undefined>;
}

@Injectable()
export class VoiceSessionOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(VoiceSessionOwnershipGuard.name);

  constructor(
    private readonly voiceSessionRepository: VoiceSessionRepository,
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

    const session = await this.voiceSessionRepository.findById(sessionId);

    if (!session) {
      this.logger.warn(
        `VoiceSessionOwnershipGuard: session not found sessionId=${sessionId} userId=${user.id}`,
      );
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Voice session not found',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (session.student_id !== user.id) {
      this.logger.warn(
        `VoiceSessionOwnershipGuard: ownership denied userId=${user.id} sessionId=${sessionId}`,
      );
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Access denied: you do not own this voice session',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    this.logger.debug(
      `VoiceSessionOwnershipGuard: ownership confirmed userId=${user.id} sessionId=${sessionId}`,
    );

    return true;
  }
}
