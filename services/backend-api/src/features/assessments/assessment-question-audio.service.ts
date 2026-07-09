// AssessmentQuestionAudioService.
//
// Scope: Lazily synthesize (and cache in-memory, via TtsAudioStorageService)
// TTS audio for a listening_choice assessment question's listening_script,
// and stream the resulting bytes back to the student. Mirrors the same
// on-demand pattern PlacementQuestionAudioService already uses.
//
// Security rules:
//   - Backend is the sole authority for question content; no client-supplied
//     text is ever synthesized.
//   - listening_script (never stem/correct answer) is the only text
//     synthesized — question_choices.is_correct is never exposed here or
//     anywhere else to students.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { TTS_GATEWAY, TtsGateway } from '../voice-teacher/tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../voice-teacher/tts-gateway/tts-safe-failure.service';

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

@Injectable()
export class AssessmentQuestionAudioService {
  private readonly logger = new Logger(AssessmentQuestionAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() @Inject(TTS_GATEWAY) private readonly ttsGateway: TtsGateway | null,
    private readonly ttsSafeFailure: TtsSafeFailureService,
  ) {}

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

    if (!this.ttsGateway) {
      this.logger.warn(
        `AssessmentQuestionAudioService.ensureAudio: TTS_GATEWAY not bound, cannot synthesize questionId=${questionId}`,
      );
      return { audioRef: null, scriptMissing: false };
    }

    const response = await this.ttsGateway.synthesize({
      text: question.listening_script,
      languageCode,
      sessionId: `assessment-question:${questionId}`,
      studentId,
    });

    const outcome = this.ttsSafeFailure.toSafeOutcome(response);

    if (outcome.isFallback || !outcome.audioRef) {
      this.logger.warn(
        `AssessmentQuestionAudioService.ensureAudio: synthesis failed for questionId=${questionId}`,
      );
      return { audioRef: null, scriptMissing: false };
    }

    return { audioRef: outcome.audioRef, scriptMissing: false };
  }
}
