// LessonAssetAudioService.
//
// Scope: Lazily synthesize TTS audio for a listening lesson's spoken
// passage — a `lesson_assets` row with `type = 'audio'` whose
// `metadata.script` holds the passage text. Mirrors
// PlacementQuestionAudioService / SessionQuestionAudioService's pattern.
//
// Security rules:
//   - Only lesson_assets.metadata->>'script' is ever synthesized.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { TTS_GATEWAY, TtsGateway } from '../voice-teacher/tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../voice-teacher/tts-gateway/tts-safe-failure.service';

export interface LessonAssetAudioResult {
  readonly audioRef: string | null;
  /** True when the asset has no script authored yet — content gap, not a transient failure. */
  readonly scriptMissing: boolean;
}

interface LessonAssetRow {
  readonly id: string;
  readonly type: string;
  readonly status: string;
  readonly metadata: { script?: string } | null;
}

@Injectable()
export class LessonAssetAudioService {
  private readonly logger = new Logger(LessonAssetAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() @Inject(TTS_GATEWAY) private readonly ttsGateway: TtsGateway | null,
    private readonly ttsSafeFailure: TtsSafeFailureService,
  ) {}

  async ensureAudio(
    assetId: string,
    studentId: string,
    languageCode: string,
  ): Promise<LessonAssetAudioResult> {
    const result = await this.db.query<LessonAssetRow>(
      `SELECT id, type, status, metadata
         FROM lesson_assets
        WHERE id = $1
        LIMIT 1`,
      [assetId],
    );

    const asset = result.rows[0];
    if (!asset || asset.status !== 'published') {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Lesson asset not found: ${assetId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (asset.type !== 'audio') {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'This lesson asset has no audio.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const script = asset.metadata?.script;
    if (!script || script.trim().length === 0) {
      return { audioRef: null, scriptMissing: true };
    }

    if (!this.ttsGateway) {
      this.logger.warn(
        `LessonAssetAudioService.ensureAudio: TTS_GATEWAY not bound, cannot synthesize assetId=${assetId}`,
      );
      return { audioRef: null, scriptMissing: false };
    }

    const response = await this.ttsGateway.synthesize({
      text: script,
      languageCode,
      sessionId: `lesson-asset:${assetId}`,
      studentId,
    });

    const outcome = this.ttsSafeFailure.toSafeOutcome(response);

    if (outcome.isFallback || !outcome.audioRef) {
      this.logger.warn(
        `LessonAssetAudioService.ensureAudio: synthesis failed for assetId=${assetId}`,
      );
      return { audioRef: null, scriptMissing: false };
    }

    return { audioRef: outcome.audioRef, scriptMissing: false };
  }
}
