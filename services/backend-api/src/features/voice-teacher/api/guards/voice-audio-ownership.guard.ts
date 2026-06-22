import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { AppError } from '../../../../common/errors/app-error';
import { VoiceAudioAssetRepository } from '../../repositories/voice-audio-asset.repository';

interface VoiceAudioRequest {
  readonly user?: { id: string };
  readonly params?: Record<string, string | undefined>;
}

@Injectable()
export class VoiceAudioOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(VoiceAudioOwnershipGuard.name);

  constructor(
    private readonly voiceAudioAssetRepository: VoiceAudioAssetRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const audioAsset = await this.voiceAudioAssetRepository.findById(audioRef);

    if (!audioAsset) {
      this.logger.warn(
        `VoiceAudioOwnershipGuard: audio asset not found audioRef=${audioRef} userId=${user.id}`,
      );
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Audio asset not found',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (audioAsset.student_id !== user.id) {
      this.logger.warn(
        `VoiceAudioOwnershipGuard: ownership denied userId=${user.id} audioRef=${audioRef}`,
      );
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Access denied: you do not own this audio asset',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    this.logger.debug(
      `VoiceAudioOwnershipGuard: ownership confirmed userId=${user.id} audioRef=${audioRef}`,
    );

    return true;
  }
}
