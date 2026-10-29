// AssessmentQuestionAudioService.
//
// Scope: Provide TTS audio for a listening_choice assessment question's
// listening_script. Audio is generated at most once per distinct script,
// language and voice and persisted in private Supabase Storage (see
// PersistentTtsAudioService); each student is then issued their own
// ownership-scoped reference, so the controller's streaming is unchanged.
//
// Security rules:
//   - Backend is the sole authority for question content; no client-supplied
//     text is ever synthesized.
//   - listening_script (never stem/correct answer) is the only text
//     synthesized — question_choices.is_correct is never exposed here or
//     anywhere else to students.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  PersistentTtsAudioService,
  isAudioWarmupEnabled,
} from '../voice-teacher/tts-gateway/persistent/persistent-tts-audio.service';

export interface AssessmentQuestionAudioResult {
  readonly audioRef: string | null;
  /** True when the question has no listening_script yet — content gap, not a transient failure. */
  readonly scriptMissing: boolean;
}

interface QuestionBankListeningRow {
  readonly id: string;
  readonly type: string;
  readonly listening_script: string | null;
}

const WARMUP_STUDENT_ID = 'assessment-warmup';
const WARMUP_LANGUAGE = 'en';
const WARMUP_MAX_QUESTIONS = 500;

@Injectable()
export class AssessmentQuestionAudioService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AssessmentQuestionAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly persistentAudio: PersistentTtsAudioService,
  ) {}

  /** Optional startup warm-up for published listening questions (see PlacementQuestionAudioService). */
  onApplicationBootstrap(): void {
    if (!isAudioWarmupEnabled()) return;
    void this.warmUp().catch((err: unknown) => {
      this.logger.warn(`AssessmentQuestionAudioService.warmUp: aborted (${err instanceof Error ? err.name : 'error'})`);
    });
  }

  async warmUp(): Promise<void> {
    const result = await this.db.query<QuestionBankListeningRow>(
      `SELECT id, type, listening_script
         FROM question_bank
        WHERE type = 'listening_choice'
          AND status = 'published'
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
      `AssessmentQuestionAudioService.warmUp: generated=${tally.generated} alreadyStored=${tally.alreadyStored} failed=${tally.failed}`,
    );
  }

  async ensureAudio(
    questionId: string,
    studentId: string,
    languageCode: string,
  ): Promise<AssessmentQuestionAudioResult> {
    const result = await this.db.query<QuestionBankListeningRow>(
      `SELECT id, type, listening_script
         FROM question_bank
        WHERE id = $1
        LIMIT 1`,
      [questionId],
    );

    const question = result.rows[0];
    if (!question) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Question not found: ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (question.type !== 'listening_choice') {
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
      scope: 'assessment-question',
      subjectId: questionId,
      questionId: null,
      script: question.listening_script,
      languageCode,
      studentId,
    });
    return { audioRef, scriptMissing: false };
  }
}
