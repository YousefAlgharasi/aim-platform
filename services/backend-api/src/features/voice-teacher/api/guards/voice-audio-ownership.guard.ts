import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AppError } from '../../../../common/errors/app-error';

interface VoiceAudioRequest {
  readonly user?: { id: string };
  readonly params?: Record<string, string | undefined>;
}

@Injectable()
export class VoiceAudioOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(VoiceAudioOwnershipGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<VoiceAudioRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const audioRef = request.params?.audioRef;
    if (!audioRef) {
      return true;
    }

    // Audio ownership is validated via the storage service (P9-064),
    // which checks that the audioRef belongs to the authenticated student.
    // Placeholder until wired via DI.

    this.logger.debug(
      `VoiceAudioOwnershipGuard: user=${user.id} audioRef=${audioRef}`,
    );

    return true;
  }
}
