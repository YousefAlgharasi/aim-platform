// LessonAssetAudioService.
//
// Scope: Provide TTS audio for a listening lesson's spoken passage — a
// `lesson_assets` row with `type = 'audio'` whose `metadata.script` holds
// the passage text. Generated at most once per distinct script, language
// and voice, persisted in private Supabase Storage (see
// PersistentTtsAudioService) and issued to each student as their own
// ownership-scoped reference.
//
// Security rules:
//   - Only lesson_assets.metadata->>'script' is ever synthesized.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  PersistentTtsAudioService,
  isAudioWarmupEnabled,
} from '../voice-teacher/tts-gateway/persistent/persistent-tts-audio.service';

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

const WARMUP_STUDENT_ID = 'lesson-warmup';
const WARMUP_LANGUAGE = 'en';
const WARMUP_MAX_ASSETS = 500;

@Injectable()
export class LessonAssetAudioService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LessonAssetAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly persistentAudio: PersistentTtsAudioService,
  ) {}

  /** Optional startup warm-up for published lesson audio (see PlacementQuestionAudioService). */
  onApplicationBootstrap(): void {
    if (!isAudioWarmupEnabled()) return;
    void this.warmUp().catch((err: unknown) => {
      this.logger.warn(`LessonAssetAudioService.warmUp: aborted (${err instanceof Error ? err.name : 'error'})`);
    });
  }

  async warmUp(): Promise<void> {
    const result = await this.db.query<LessonAssetRow>(
      `SELECT id, type, status, metadata
         FROM lesson_assets
        WHERE type = 'audio'
          AND status = 'published'
          AND btrim(coalesce(metadata->>'script', '')) <> ''
        LIMIT ${WARMUP_MAX_ASSETS}`,
    );
    const tally = await this.persistentAudio.warmUp(
      // question_id in tts_audio_assets is a placement-only foreign key, so other content passes null.
      result.rows.map((row) => ({ questionId: null, script: row.metadata?.script as string })),
      WARMUP_LANGUAGE,
      WARMUP_STUDENT_ID,
    );
    this.logger.log(
      `LessonAssetAudioService.warmUp: generated=${tally.generated} alreadyStored=${tally.alreadyStored} failed=${tally.failed}`,
    );
  }

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

    const audioRef = await this.persistentAudio.getStudentAudioRef({
      scope: 'lesson-asset',
      subjectId: assetId,
      questionId: null,
      script,
      languageCode,
      studentId,
    });
    return { audioRef, scriptMissing: false };
  }
}
