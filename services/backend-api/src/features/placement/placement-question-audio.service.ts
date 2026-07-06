// PlacementQuestionAudioService.
//
// Scope: Lazily synthesize (and cache in-memory) TTS audio for a
// listening_choice placement question's listening_script, and stream the
// resulting bytes back to the student. Mirrors the same on-demand pattern
// VoiceMessageAudioService already uses for AI Teacher chat replies.
//
// Security rules:
//   - Backend is the sole authority for question content; no client-supplied
//     text is ever synthesized.
//   - listening_script (never prompt/correct_answer) is the only text
//     synthesized — prompt holds on-screen instructions/options, not the
//     line(s) meant to be heard, and correct_answer is never exposed here
//     or anywhere else to students.
//   - No secrets, service-role keys, or AI provider keys are stored/logged.

import { HttpStatus, Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { TTS_GATEWAY, TtsGateway } from '../voice-teacher/tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../voice-teacher/tts-gateway/tts-safe-failure.service';

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

@Injectable()
export class PlacementQuestionAudioService {
  private readonly logger = new Logger(PlacementQuestionAudioService.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() @Inject(TTS_GATEWAY) private readonly ttsGateway: TtsGateway | null,
    private readonly ttsSafeFailure: TtsSafeFailureService,
  ) {}

  async ensureAudio(
    questionId: string,
    studentId: string,
    languageCode: string,
  ): Promise<PlacementQuestionAudioResult> {
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

    if (!this.ttsGateway) {
      this.logger.warn(
        `PlacementQuestionAudioService.ensureAudio: TTS_GATEWAY not bound, cannot synthesize questionId=${questionId}`,
      );
      return { audioRef: null, scriptMissing: false };
    }

    const response = await this.ttsGateway.synthesize({
      text: question.listening_script,
      languageCode,
      sessionId: `placement-question:${questionId}`,
      studentId,
    });

    const outcome = this.ttsSafeFailure.toSafeOutcome(response);

    if (outcome.isFallback || !outcome.audioRef) {
      this.logger.warn(
        `PlacementQuestionAudioService.ensureAudio: synthesis failed for questionId=${questionId}`,
      );
      return { audioRef: null, scriptMissing: false };
    }

    return { audioRef: outcome.audioRef, scriptMissing: false };
  }
}
