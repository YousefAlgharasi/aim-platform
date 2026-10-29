// SessionQuestionAudioService.
//
// Scope: Provide TTS audio for a question_bank `listening_choice` item's
// listening_script. Audio is generated at most once per distinct script,
// language and voice and persisted in private Supabase Storage (see
// PersistentTtsAudioService); each student is issued their own
// ownership-scoped reference, so the controller's streaming is unchanged.
//
// Security rules:
//   - Backend is the sole authority for question content; no client-supplied
//     text is ever synthesized.
//   - listening_script (never stem/explanation/correct answer data) is the
//     only text synthesized.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  PersistentTtsAudioService,
  isAudioWarmupEnabled,
} from '../voice-teacher/tts-gateway/persistent/persistent-tts-audio.service';

export interface SessionQuestionAudioResult {
  readonly audioRef: string | null;
  /** True when the question has no listening_script yet — content gap, not a transient failure. */
  readonly scriptMissing: boolean;
}

interface QuestionBankListeningRow {
  readonly id: string;
  readonly type: string;
  readonly listening_script: string | null;
  readonly status: string;
}

const WARMUP_STUDENT_ID = 'practice-warmup';
const WARMUP_LANGUAGE = 'en';
const WARMUP_MAX_QUESTIONS = 500;

@Injectable()
export class SessionQuestionAudioService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SessionQuestionAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly persistentAudio: PersistentTtsAudioService,
  ) {}

  /** Optional startup warm-up for published listening questions (see PlacementQuestionAudioService). */
  onApplicationBootstrap(): void {
    if (!isAudioWarmupEnabled()) return;
    void this.warmUp().catch((err: unknown) => {
      this.logger.warn(`SessionQuestionAudioService.warmUp: aborted (${err instanceof Error ? err.name : 'error'})`);
    });
  }

  async warmUp(): Promise<void> {
    const result = await this.db.query<QuestionBankListeningRow>(
      `SELECT id, type, listening_script, status
         FROM question_bank
        WHERE status = 'published'
          AND listening_script IS NOT NULL
          AND btrim(listening_script) <> ''
        LIMIT ${WARMUP_MAX_QUESTIONS}`,
    );
    const tally = await this.persistentAudio.warmUp(
      // question_id in tts_audio_assets is a placement-only foreign key, so other content passes null.
      result.rows.map((row) => ({ questionId: null, script: row.listening_script as string })),
      WARMUP_LANGUAGE,
      WARMUP_STUDENT_ID,
    );
    this.logger.log(
      `SessionQuestionAudioService.warmUp: generated=${tally.generated} alreadyStored=${tally.alreadyStored} failed=${tally.failed}`,
    );
  }

  async ensureAudio(
    questionId: string,
    studentId: string,
    languageCode: string,
  ): Promise<SessionQuestionAudioResult> {
    const result = await this.db.query<QuestionBankListeningRow>(
      `SELECT id, type, listening_script, status
         FROM question_bank
        WHERE id = $1
        LIMIT 1`,
      [questionId],
    );

    const question = result.rows[0];
    if (!question || question.status !== 'published') {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Question not found: ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const hasListeningScript = Boolean(
      question.listening_script && question.listening_script.trim().length > 0,
    );
    if (question.type !== 'listening_choice' && !hasListeningScript) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'This question has no listening audio.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!question.listening_script || question.listening_script.trim().length === 0) {
      return { audioRef: null, scriptMissing: true };
    }

    const audioRef = await this.persistentAudio.getStudentAudioRef({
      scope: 'practice-question',
      subjectId: questionId,
      questionId: null,
      script: question.listening_script,
      languageCode,
      studentId,
    });
    return { audioRef, scriptMissing: false };
  }
}
