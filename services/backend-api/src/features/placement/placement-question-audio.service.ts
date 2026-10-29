// PlacementQuestionAudioService.
//
// Scope: Provide TTS audio for a listening_choice placement question's
// listening_script. Audio is generated at most once per distinct
// (script, language, voice configuration) and persisted in a private
// Supabase Storage bucket (see PersistentTtsAudioService), so it is shared
// across students, backend restarts and backend instances. This service
// then hands each student their own ownership-scoped audio reference, so
// the controller's existing authorized streaming is unchanged.
//
// Security rules:
//   - Backend is the sole authority for question content; no client-supplied
//     text is ever synthesized.
//   - listening_script (never prompt/correct_answer) is the only text
//     synthesized — prompt holds on-screen instructions/options, not the
//     line(s) meant to be heard, and correct_answer is never exposed here
//     or anywhere else to students.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  PersistentTtsAudioService,
  isAudioWarmupEnabled,
} from '../voice-teacher/tts-gateway/persistent/persistent-tts-audio.service';

export interface PlacementQuestionAudioResult {
  readonly audioRef: string | null;
  /** True when the question has no listening_script yet — content gap, not a transient failure. */
  readonly scriptMissing: boolean;
}

interface PlacementListeningQuestionRow {
  readonly id: string;
  readonly question_type: string;
  readonly listening_script: string | null;
}

const WARMUP_STUDENT_ID = 'placement-warmup';
const WARMUP_LANGUAGE = 'en';
const WARMUP_MAX_QUESTIONS = 200;

@Injectable()
export class PlacementQuestionAudioService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PlacementQuestionAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly persistentAudio: PersistentTtsAudioService,
  ) {}

  /**
   * Optional: generates audio for listening questions that have no stored asset yet, so the very first
   * student never waits. Correctness does not depend on it (a missing asset is generated on demand).
   * Existing assets are skipped without being downloaded or regenerated. Production only; disable with
   * TTS_AUDIO_WARMUP=false (or the older PLACEMENT_AUDIO_WARMUP=false).
   */
  onApplicationBootstrap(): void {
    if (!isAudioWarmupEnabled()) return;
    void this.warmUp().catch((err: unknown) => {
      this.logger.warn(`PlacementQuestionAudioService.warmUp: aborted (${err instanceof Error ? err.name : 'error'})`);
    });
  }

  async warmUp(): Promise<void> {
    const result = await this.db.query<PlacementListeningQuestionRow>(
      `SELECT id, question_type, listening_script
         FROM placement_questions
        WHERE question_type = 'listening_choice'
          AND listening_script IS NOT NULL
          AND btrim(listening_script) <> ''
        LIMIT ${WARMUP_MAX_QUESTIONS}`,
    );
    const tally = await this.persistentAudio.warmUp(
      result.rows.map((row) => ({ questionId: row.id, script: row.listening_script as string })),
      WARMUP_LANGUAGE,
      WARMUP_STUDENT_ID,
    );
    this.logger.log(
      `PlacementQuestionAudioService.warmUp: generated=${tally.generated} alreadyStored=${tally.alreadyStored} failed=${tally.failed}`,
    );
  }

  async ensureAudio(
    questionId: string,
    studentId: string,
    languageCode: string,
  ): Promise<PlacementQuestionAudioResult> {
    if (!studentId || studentId.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'A student identity is required to access question audio.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const result = await this.db.query<PlacementListeningQuestionRow>(
      `SELECT id, question_type, listening_script
         FROM placement_questions
        WHERE id = $1
        LIMIT 1`,
      [questionId],
    );

    const question = result.rows[0];
    if (!question) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Placement question not found: ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (question.question_type !== 'listening_choice') {
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
      scope: 'placement-question',
      subjectId: questionId,
      // Only placement questions can be referenced here; the column is a foreign key to placement_questions.
      questionId,
      script: question.listening_script,
      languageCode,
      studentId,
    });
    return { audioRef, scriptMissing: false };
  }
}
