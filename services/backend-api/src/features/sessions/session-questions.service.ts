// AIM pipeline live wiring — session question delivery + attempt item resolution.
//
// Scope: Student-facing question delivery for an active learning session, and
//        backend-side resolution of the item a student answered (the fields
//        POST /sessions/:sessionId/attempt must never trust from a client:
//        isCorrect, skillIds, presentedDifficulty, answerFormat,
//        optionsPresentedCount).
//
// Why this exists:
//   Phase 6 built the Flutter question/answer feature against
//   GET /curriculum/questions/:id — an admin-permission-gated question_bank
//   endpoint that students cannot call and that carries no options. No
//   student-reachable endpoint delivered questions for a learning session,
//   so the P5-066/P5-067 session flow (and therefore the whole AIM pipeline)
//   was unreachable from the app. This service closes that gap using the
//   real content chain that exists in the live schema:
//     lesson_skills -> skills -> question_skills -> question_bank
//                                                -> question_choices
//                                                -> question_answers
//
//   Content-source note: delivery originally read from the `questions` table
//   via question_skill_links, but question_choices/question_answers FK to
//   question_bank, and the `questions` rows have no answer data anywhere —
//   so every delivered question had zero options and every answer graded
//   incorrect. question_bank is the only table with real choices and answer
//   keys (verified against the live DB), so delivery and grading both read
//   from question_bank via question_skills.
//
// Security rules (same posture as the rest of features/sessions):
//   - studentId is always JWT-resolved by the caller; never a client value.
//   - Question delivery verifies active-session ownership first; missing,
//     foreign, or inactive sessions surface as NOT_FOUND.
//   - P20-010 course gating is enforced via LessonProgressService's shared
//     assertCourseUnlockedForLesson (403 for a locked course) — a client
//     showing a locked course as open must not bypass the server.
//   - is_correct / correct answers are NEVER included in delivered questions.
//   - Correctness is evaluated exclusively here, backend-side, from
//     question_choices.is_correct / question_answers.value.
//   - No AIM Engine call is made here; features/sessions never talks to the
//     AIM Engine. Only features/aim does.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { LessonProgressService } from '../lessons/lesson-progress.service';
import {
  AttemptAnswerFormat,
  AttemptDifficultyLevel,
  AttemptItemType,
} from './lesson-attempt.types';

// ---------------------------------------------------------------------------
// Delivered shapes (student-safe — no correctness data)
// ---------------------------------------------------------------------------

/** A single answer choice as delivered to the client. is_correct is stripped. */
export interface DeliveredSessionOption {
  readonly id: string;
  readonly text: string;
  readonly order: number;
}

/**
 * A question as delivered to the client for a learning session.
 * Field names match the Flutter QuestionModel contract (P6-084):
 * id / type / stem / difficulty / tags / options. No correctness data.
 */
export interface DeliveredSessionQuestion {
  readonly id: string;
  readonly type: string;
  readonly stem: string;
  readonly difficulty: string;
  readonly tags: readonly string[];
  readonly options: readonly DeliveredSessionOption[];
}

export interface SessionLessonQuestionsResponse {
  readonly lessonId: string;
  readonly questions: readonly DeliveredSessionQuestion[];
}

// ---------------------------------------------------------------------------
// Resolved attempt item — the backend-owned fields for RecordLessonAttemptInput
// ---------------------------------------------------------------------------

export interface ResolvedAttemptItem {
  readonly itemType: AttemptItemType;
  readonly answerFormat: AttemptAnswerFormat;
  readonly skillIds: readonly string[];
  readonly presentedDifficulty: AttemptDifficultyLevel;
  readonly optionsPresentedCount: number | null;
  readonly isCorrect: boolean;
}

// ---------------------------------------------------------------------------
// Internal row shapes
// ---------------------------------------------------------------------------

interface QuestionRow {
  readonly id: string;
  readonly type: string;
  readonly difficulty: string;
  readonly stem: string;
  readonly tags: readonly string[] | null;
}

interface ChoiceRow {
  readonly id: string;
  readonly question_id: string;
  readonly text: string;
  readonly sort_order: number;
  readonly is_correct: boolean;
}

interface SkillLinkRow {
  readonly skill_key: string;
}

interface AnswerValueRow {
  readonly value: unknown;
}

/** question_bank.type values with selectable options (delivered via question_choices). */
const OPTION_BASED_QUESTION_TYPES = new Set([
  'multiple_choice',
  'true_false',
  'listening_choice',
]);

/**
 * question_bank.type -> lesson_attempts.answer_format (P5-032 enum).
 * Live question_bank.type values verified against Supabase: multiple_choice,
 * true_false, fill_in_the_blank.
 */
const ANSWER_FORMAT_BY_QUESTION_TYPE: Record<string, AttemptAnswerFormat> = {
  multiple_choice: 'multiple_choice',
  true_false: 'true_false',
  listening_choice: 'listening_choice',
  fill_in_the_blank: 'fill_blank',
  fill_in_blank: 'fill_blank',
  fill_blank: 'fill_blank',
};

/**
 * question_bank.difficulty -> presented_difficulty (1–4).
 * The 1–4 scale is the P5-032 lesson_attempts contract. Live question_bank
 * rows use beginner/elementary/intermediate; the easy/medium/hard set is
 * kept for any content that still uses the older three-word scale.
 */
const DIFFICULTY_BY_LABEL: Record<string, AttemptDifficultyLevel> = {
  beginner: 1,
  elementary: 2,
  intermediate: 3,
  advanced: 4,
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

const DEFAULT_PRESENTED_DIFFICULTY: AttemptDifficultyLevel = 2;

@Injectable()
export class SessionQuestionsService {
  private readonly logger = new Logger(SessionQuestionsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly lessonProgress: LessonProgressService,
  ) {}

  /**
   * Deliver the published questions for a lesson to a student's active
   * learning session.
   *
   * Steps:
   *   1. Verify the session exists, belongs to the student, and is active
   *      (NOT_FOUND otherwise — never leaks session existence).
   *   2. Enforce P20-010 course gating for the lesson (403 when locked).
   *   3. Verify the lesson exists and is published.
   *   4. Resolve questions via lesson_skills -> skills -> question_skills ->
   *      question_bank, published only, options included with is_correct
   *      stripped.
   */
  async listQuestionsForLesson(
    studentId: string,
    sessionId: string,
    lessonId: string,
  ): Promise<SessionLessonQuestionsResponse> {
    await this.verifyActiveSessionOwnership(sessionId, studentId);
    await this.lessonProgress.assertCourseUnlockedForLesson(studentId, lessonId);
    await this.assertPublishedLesson(lessonId);

    const questionsResult = await this.db.query<QuestionRow & { created_at: string }>(
      `SELECT DISTINCT qb.id, qb.type, qb.difficulty, qb.stem, qb.tags, qb.created_at
         FROM lesson_skills ls
         JOIN skills s ON s.id = ls.skill_id
         JOIN question_skills qs ON qs.skill_id = s.id
         JOIN question_bank qb ON qb.id = qs.question_id
        WHERE ls.lesson_id = $1
          AND qb.status = 'published'
        ORDER BY qb.created_at ASC, qb.id ASC`,
      [lessonId],
    );

    const questionIds = questionsResult.rows.map((q) => q.id);
    const choicesByQuestion = await this.fetchChoices(questionIds);

    return {
      lessonId,
      questions: questionsResult.rows.map((q) => ({
        id: q.id,
        type: q.type,
        stem: q.stem,
        difficulty: q.difficulty,
        tags: this.extractTags(q.tags),
        options: (choicesByQuestion.get(q.id) ?? []).map((c, index) => ({
          id: c.id,
          text: c.text,
          order: c.sort_order ?? index,
        })),
      })),
    };
  }

  /**
   * Resolve the backend-owned attempt fields for the item the student
   * answered. This is what makes POST /sessions/:sessionId/attempt honest:
   * isCorrect, skillIds, answerFormat, presentedDifficulty, and
   * optionsPresentedCount are all derived from the item record — never from
   * the client.
   *
   * Correctness evaluation:
   *   - Option-based types: answerValue must equal the id of the choice
   *     marked is_correct (falls back to a case-insensitive text match so a
   *     legitimate client sending the option label still grades correctly).
   *   - Text types: answerValue is compared case-insensitively against the
   *     accepted values in question_answers.value (string, {text|value}, or
   *     array of either).
   *   - When a published question has no grading data at all (a real content
   *     gap in the live DB today), the attempt is recorded as incorrect and
   *     a warning is logged — correctness is never guessed or fabricated.
   */
  async resolveItemForAttempt(
    itemId: string,
    answerValue: string,
  ): Promise<ResolvedAttemptItem> {
    const questionResult = await this.db.query<QuestionRow>(
      `SELECT id, type, difficulty, stem, tags
         FROM question_bank
        WHERE id = $1 AND status = 'published'
        LIMIT 1`,
      [itemId],
    );
    const question = questionResult.rows[0];
    if (!question) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Question not found: ${itemId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const skillLinksResult = await this.db.query<SkillLinkRow>(
      `SELECT s.key AS skill_key
         FROM question_skills qs
         JOIN skills s ON s.id = qs.skill_id
        WHERE qs.question_id = $1`,
      [itemId],
    );
    const skillIds = skillLinksResult.rows.map((r) => r.skill_key);

    const answerFormat =
      ANSWER_FORMAT_BY_QUESTION_TYPE[question.type] ?? 'free_text';
    const presentedDifficulty =
      DIFFICULTY_BY_LABEL[question.difficulty] ?? DEFAULT_PRESENTED_DIFFICULTY;

    if (OPTION_BASED_QUESTION_TYPES.has(question.type)) {
      const choices =
        (await this.fetchChoices([itemId])).get(itemId) ?? [];
      const isCorrect = this.evaluateChoiceAnswer(itemId, choices, answerValue);
      return {
        itemType: 'lesson_question',
        answerFormat,
        skillIds,
        presentedDifficulty,
        optionsPresentedCount: choices.length,
        isCorrect,
      };
    }

    const isCorrect = await this.evaluateTextAnswer(itemId, answerValue);
    return {
      itemType: 'lesson_question',
      answerFormat,
      skillIds,
      presentedDifficulty,
      optionsPresentedCount: null,
      isCorrect,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async verifyActiveSessionOwnership(
    sessionId: string,
    studentId: string,
  ): Promise<void> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM learning_sessions
        WHERE id = $1 AND student_id = $2 AND status = 'active'`,
      [sessionId, studentId],
    );
    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'No active learning session found for this student.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }

  private async assertPublishedLesson(lessonId: string): Promise<void> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM lessons WHERE id = $1 AND status = 'published'`,
      [lessonId],
    );
    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Lesson not found: ${lessonId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }

  private async fetchChoices(
    questionIds: readonly string[],
  ): Promise<Map<string, ChoiceRow[]>> {
    if (questionIds.length === 0) return new Map();
    const result = await this.db.query<ChoiceRow>(
      `SELECT id, question_id, text, sort_order, is_correct
         FROM question_choices
        WHERE question_id = ANY($1)
        ORDER BY sort_order ASC, created_at ASC`,
      [questionIds],
    );
    const byQuestion = new Map<string, ChoiceRow[]>();
    for (const row of result.rows) {
      const list = byQuestion.get(row.question_id) ?? [];
      list.push(row);
      byQuestion.set(row.question_id, list);
    }
    return byQuestion;
  }

  private extractTags(tags: readonly string[] | null | undefined): string[] {
    if (!Array.isArray(tags)) return [];
    return tags.filter((t): t is string => typeof t === 'string');
  }

  private evaluateChoiceAnswer(
    itemId: string,
    choices: readonly ChoiceRow[],
    answerValue: string,
  ): boolean {
    const correct = choices.filter((c) => c.is_correct);
    if (choices.length === 0 || correct.length === 0) {
      this.logger.warn('session_question_missing_grading_data', {
        itemId,
        reason: choices.length === 0 ? 'no_choices' : 'no_correct_choice',
      });
      return false;
    }
    const normalized = answerValue.trim().toLowerCase();
    return correct.some(
      (c) =>
        c.id === answerValue ||
        c.text.trim().toLowerCase() === normalized,
    );
  }

  private async evaluateTextAnswer(
    itemId: string,
    answerValue: string,
  ): Promise<boolean> {
    const result = await this.db.query<AnswerValueRow>(
      `SELECT value FROM question_answers WHERE question_id = $1`,
      [itemId],
    );
    if (result.rows.length === 0) {
      this.logger.warn('session_question_missing_grading_data', {
        itemId,
        reason: 'no_question_answers',
      });
      return false;
    }
    const normalized = answerValue.trim().toLowerCase();
    return result.rows.some((row) =>
      this.acceptedTextValues(row.value).some((v) => v === normalized),
    );
  }

  /** Flatten question_answers.value (string | {text|value} | array) to normalized strings. */
  private acceptedTextValues(value: unknown): string[] {
    if (typeof value === 'string') return [value.trim().toLowerCase()];
    if (Array.isArray(value)) {
      return value.flatMap((v) => this.acceptedTextValues(v));
    }
    if (value !== null && typeof value === 'object') {
      const obj = value as { text?: unknown; value?: unknown };
      return [
        ...this.acceptedTextValues(obj.text ?? null),
        ...this.acceptedTextValues(obj.value ?? null),
      ];
    }
    return [];
  }
}
