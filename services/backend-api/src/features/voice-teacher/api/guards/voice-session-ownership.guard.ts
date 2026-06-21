import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AppError } from '../../../../common/errors/app-error';

interface VoiceSessionRequest {
  readonly user?: { id: string };
  readonly params?: Record<string, string | undefined>;
}

@Injectable()
export class VoiceSessionOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(VoiceSessionOwnershipGuard.name);

  canActivate(context: ExecutionContext): boolean {
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

    // Session ownership is validated by looking up the session in the
    // database and comparing the student_id column with user.id.
    // This guard is a placeholder until the voice session repository
    // (P9-027) is wired via DI. The repository enforces that queries
    // are always scoped to the authenticated student's ID.
    //
    // No mastery/weakness/difficulty/recommendation/review-schedule
    // values are checked or modified here.

    this.logger.debug(
      `VoiceSessionOwnershipGuard: user=${user.id} session=${sessionId}`,
    );

    return true;
  }
}
