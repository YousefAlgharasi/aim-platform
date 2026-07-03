/**
 * AIM state assembly service — Phase 5 (P5-047 through P5-055), implemented P20-005.
 *
 * Owns Stage 3 of the backend AIM pipeline: reads all required backend state
 * and composes the structured AIM Engine request payload (P5-009, P5-010,
 * P5-021).
 *
 * Data sources (confirmed against the live schema before writing queries):
 *   - learning_sessions  — session-level context (P5-052 SessionsService writes it).
 *   - lesson_attempts    — attempt-level context (P5-054 LessonAttemptService writes it).
 *   - session_events     — raw behavioral counts (hesitation/retry/idle_gap;
 *                          P5-053 SessionEventService writes it and explicitly
 *                          defers this aggregation to this service).
 *   - placement_results  — initial post-placement bootstrap context.
 *
 * Scope rules:
 * - This service reads backend state; it never computes mastery, level,
 *   weakness, difficulty, recommendations, review schedules, retention,
 *   or frustration. Those are exclusively AIM Engine outputs.
 * - Speed and response-time signals are passed through as raw behavioral
 *   context only.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AimPipelineContext } from './aim-pipeline-orchestrator.service';
import {
  AimAnswerFormat,
  AimAttemptContextInput,
  AimItemType,
  AimLevelSource,
  AimMappingContext,
  AimPlacementContextInput,
  AimRecentAttemptSnapshotInput,
  AimSessionContextInput,
  AimSessionType,
  AimSkillMasteryContextInput,
} from '../adapter/aim-request-mapper.types';

/** Bounded window of prior attempts fed into MasteryCalculator per skill (P20-007). */
const RECENT_ATTEMPTS_WINDOW = 10;

// ---------------------------------------------------------------------------
// Assembly result — a tagged union so callers can never confuse "not enough
// data yet" with a stub/no-op or a hard failure. `insufficient_data` is a
// clean, deliberate, expected outcome (e.g. a session with zero attempts so
// far); it is never thrown as an error.
// ---------------------------------------------------------------------------

export type AimStateAssemblyResult =
  | { readonly status: 'assembled'; readonly context: AimMappingContext }
  | { readonly status: 'insufficient_data'; readonly reason: string };

// ---------------------------------------------------------------------------
// DB row shapes (internal)
// ---------------------------------------------------------------------------

interface LearningSessionRow {
  readonly id: string;
  readonly student_id: string;
  readonly session_type: string;
  readonly started_at: string;
  readonly last_activity_at: string;
  readonly current_level: string;
  readonly level_source: string;
  readonly level_set_at: string;
  readonly skill_focus_ids: string[];
  readonly placement_result_id: string | null;
  readonly placement_completed_at: string | null;
  readonly contract_version: string;
}

interface LessonAttemptRow {
  readonly id: string;
  readonly learning_session_id: string;
  readonly item_id: string;
  readonly item_type: string;
  readonly skill_ids: string[];
  readonly presented_difficulty: number;
  readonly answer_format: string;
  readonly answer_value: string;
  readonly options_presented_count: number | null;
  readonly is_correct: boolean;
  readonly attempt_number_for_item: number;
  readonly started_at: string;
  readonly submitted_at: string;
  readonly response_time_ms: number;
  readonly answer_change_count: number;
  readonly hesitation_before_submit_ms: number | null;
  readonly used_hint: boolean;
  readonly abandoned_first_then_retried: boolean;
}

interface EventCountRow {
  readonly event_type: string;
  readonly count: string;
}

interface SkillStateRow {
  readonly skill_id: string;
  readonly mastery_score: string;
  readonly last_evaluated_at: string;
}

interface SkillDomainRow {
  readonly key: string;
  readonly domain: string;
}

interface HistoricalAttemptRow {
  readonly skill_ids: string[];
  readonly is_correct: boolean;
  readonly attempt_number_for_item: number;
  readonly presented_difficulty: number;
  readonly used_hint: boolean;
}

@Injectable()
export class AimStateAssemblyService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Assemble the AIM Engine request payload from backend-persisted state.
   *
   * Returns `{ status: 'insufficient_data' }` (not an exception) when the
   * session genuinely has no attempts yet — a deliberate, clean skip for the
   * orchestrator to distinguish from a real failure. Throws AppError for
   * contract violations that indicate a bug upstream (missing session,
   * an attemptId that doesn't belong to the session).
   */
  async assemble(context: AimPipelineContext): Promise<AimStateAssemblyResult> {
    const session = await this.fetchSession(context.sessionId, context.studentId);
    if (!session) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Learning session not found: ${context.sessionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const attempts = await this.fetchAttempts(context.sessionId);
    if (attempts.length === 0) {
      return {
        status: 'insufficient_data',
        reason: 'Session has no recorded attempts yet.',
      };
    }

    const triggeringAttempt = attempts.find((a) => a.id === context.attemptId);
    if (!triggeringAttempt) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Attempt ${context.attemptId} does not belong to session ${context.sessionId}.`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const eventCounts = await this.fetchEventCounts(context.sessionId);
    const placementContext = await this.buildPlacementContext(session);
    const skillMasteryContext = await this.buildSkillMasteryContext(
      session.student_id,
      triggeringAttempt,
    );

    const sessionInput: AimSessionContextInput = {
      sessionId: session.id,
      studentId: session.student_id,
      sessionType: session.session_type as AimSessionType,
      startedAt: session.started_at,
      lastActivityAt: session.last_activity_at,
      skillFocusIds: session.skill_focus_ids,
      levelContext: {
        currentLevel: session.current_level,
        levelSource: session.level_source as AimLevelSource,
        levelSetAt: session.level_set_at,
      },
      placementContext,
      behavioralContext: this.buildSessionBehavioralContext(attempts, eventCounts),
      contractVersion: session.contract_version,
    };

    const attemptInput: AimAttemptContextInput = this.mapAttempt(triggeringAttempt);

    return {
      status: 'assembled',
      context: {
        backendRequestId: randomUUID(),
        xRequestId: context.xRequestId,
        session: sessionInput,
        attempts: [attemptInput],
        skillMasteryContext,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Private: fetch session/attempt/event data
  // -------------------------------------------------------------------------

  private async fetchSession(
    sessionId: string,
    studentId: string,
  ): Promise<LearningSessionRow | null> {
    const result = await this.db.query<LearningSessionRow>(
      `SELECT id, student_id, session_type, started_at, last_activity_at,
              current_level, level_source, level_set_at, skill_focus_ids,
              placement_result_id, placement_completed_at, contract_version
       FROM learning_sessions
       WHERE id = $1 AND student_id = $2
       LIMIT 1`,
      [sessionId, studentId],
    );
    return result.rows[0] ?? null;
  }

  private async fetchAttempts(sessionId: string): Promise<LessonAttemptRow[]> {
    const result = await this.db.query<LessonAttemptRow>(
      `SELECT id, learning_session_id, item_id, item_type, skill_ids,
              presented_difficulty, answer_format, answer_value,
              options_presented_count, is_correct, attempt_number_for_item,
              started_at, submitted_at, response_time_ms,
              answer_change_count, hesitation_before_submit_ms,
              used_hint, abandoned_first_then_retried
       FROM lesson_attempts
       WHERE learning_session_id = $1
       ORDER BY submitted_at ASC`,
      [sessionId],
    );
    return result.rows;
  }

  private async fetchEventCounts(sessionId: string): Promise<Map<string, number>> {
    const result = await this.db.query<EventCountRow>(
      `SELECT event_type, COUNT(*)::text AS count
       FROM session_events
       WHERE learning_session_id = $1
       GROUP BY event_type`,
      [sessionId],
    );
    return new Map(result.rows.map((r) => [r.event_type, parseInt(r.count, 10)]));
  }

  /**
   * Placement bootstrap context — present only while the AIM Engine has no
   * stable skill-state history for the student yet (per
   * AimPlacementContextInput's docstring: "None once the AIM Engine has
   * stable skill-state history for the student"). learning_sessions always
   * carries the student's latest placement_result_id/placement_completed_at
   * (P5-052 sets it on every session, not just the first), so that alone
   * can't distinguish "first" from "later" — student_skill_states existing
   * is the real signal the AIM Engine has already produced history.
   *
   * initialSkillSignals is intentionally always empty: skill_mastery_map is
   * stored as section-level aggregates only (grammar/vocabulary/reading/
   * listening), not per-skill signals — there is no real per-skill placement
   * signal data to populate this field with today (confirmed against live
   * placement_results rows). Fabricating one would violate the "don't
   * fabricate data" rule, so this is left empty rather than guessed.
   */
  private async buildPlacementContext(
    session: LearningSessionRow,
  ): Promise<AimPlacementContextInput | null> {
    if (!session.placement_result_id || !session.placement_completed_at) {
      return null;
    }

    const skillStateResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM student_skill_states WHERE student_id = $1`,
      [session.student_id],
    );
    const hasSkillStateHistory = parseInt(skillStateResult.rows[0]?.count ?? '0', 10) > 0;
    if (hasSkillStateHistory) {
      return null;
    }

    return {
      placementResultId: session.placement_result_id,
      placementCompletedAt: session.placement_completed_at,
      initialSkillSignals: [],
    };
  }

  /**
   * Prior mastery/attempt/retention history per skill (P20-007/P20-008),
   * feeding the AIM Engine's ported MasteryCalculator and RetentionTracker.
   * Sourced from student_skill_states (previous mastery, last evaluated at),
   * lesson_attempts (recent history), and skills.domain (category) — all
   * backend-only queries; the AIM Engine never queries a database itself.
   *
   * retentionHistory is always empty: the backend does not persist a
   * rolling per-skill timestamped mastery series (student_skill_states
   * stores only the current and one prior value, not a series) — a known
   * data gap, not a fabricated value. See AimSkillMasteryContext's schema
   * docstring on the AIM Engine side for the same note.
   */
  private async buildSkillMasteryContext(
    studentId: string,
    triggeringAttempt: LessonAttemptRow,
  ): Promise<Record<string, AimSkillMasteryContextInput>> {
    const skillIds = triggeringAttempt.skill_ids;
    if (skillIds.length === 0) return {};

    const [skillStateBySkill, historyBySkill, categoryBySkill] = await Promise.all([
      this.fetchPreviousSkillStates(studentId, skillIds),
      this.fetchRecentAttemptsBySkill(studentId, skillIds, triggeringAttempt.id),
      this.fetchSkillCategories(skillIds),
    ]);

    const context: Record<string, AimSkillMasteryContextInput> = {};
    for (const skillId of skillIds) {
      const skillState = skillStateBySkill.get(skillId);
      context[skillId] = {
        previousMasteryScore: skillState?.masteryScore ?? null,
        recentAttempts: historyBySkill.get(skillId) ?? [],
        category: categoryBySkill.get(skillId) ?? null,
        lastEvaluatedAt: skillState?.lastEvaluatedAt ?? null,
        retentionHistory: [],
      };
    }
    return context;
  }

  private async fetchPreviousSkillStates(
    studentId: string,
    skillIds: readonly string[],
  ): Promise<Map<string, { masteryScore: number; lastEvaluatedAt: string }>> {
    const result = await this.db.query<SkillStateRow>(
      `SELECT skill_id, mastery_score, last_evaluated_at
       FROM student_skill_states
       WHERE student_id = $1 AND skill_id = ANY($2)`,
      [studentId, skillIds],
    );
    return new Map(
      result.rows.map((r) => [
        r.skill_id,
        { masteryScore: parseFloat(r.mastery_score), lastEvaluatedAt: r.last_evaluated_at },
      ]),
    );
  }

  private async fetchSkillCategories(
    skillIds: readonly string[],
  ): Promise<Map<string, string>> {
    const result = await this.db.query<SkillDomainRow>(
      `SELECT key, domain FROM skills WHERE key = ANY($1)`,
      [skillIds],
    );
    return new Map(result.rows.map((r) => [r.key, r.domain]));
  }

  private async fetchRecentAttemptsBySkill(
    studentId: string,
    skillIds: readonly string[],
    excludeAttemptId: string,
  ): Promise<Map<string, AimRecentAttemptSnapshotInput[]>> {
    const result = await this.db.query<HistoricalAttemptRow>(
      `SELECT skill_ids, is_correct, attempt_number_for_item, presented_difficulty, used_hint
       FROM lesson_attempts
       WHERE student_id = $1
         AND skill_ids ?| $2::text[]
         AND id != $3
       ORDER BY submitted_at ASC`,
      [studentId, skillIds, excludeAttemptId],
    );

    const bySkill = new Map<string, AimRecentAttemptSnapshotInput[]>();
    for (const row of result.rows) {
      const snapshot: AimRecentAttemptSnapshotInput = {
        isCorrect: row.is_correct,
        attemptNumberForItem: row.attempt_number_for_item,
        presentedDifficulty: row.presented_difficulty as AimRecentAttemptSnapshotInput['presentedDifficulty'],
        usedHint: row.used_hint,
        skip: false, // lesson_attempts has no skip-tracking column yet.
      };
      for (const skillId of row.skill_ids) {
        if (!skillIds.includes(skillId)) continue;
        const existing = bySkill.get(skillId) ?? [];
        existing.push(snapshot);
        bySkill.set(skillId, existing);
      }
    }

    // Cap to the most recent window per skill (rows are ascending, so keep the tail).
    for (const [skillId, snapshots] of bySkill) {
      if (snapshots.length > RECENT_ATTEMPTS_WINDOW) {
        bySkill.set(skillId, snapshots.slice(-RECENT_ATTEMPTS_WINDOW));
      }
    }
    return bySkill;
  }

  private buildSessionBehavioralContext(
    attempts: readonly LessonAttemptRow[],
    eventCounts: Map<string, number>,
  ) {
    const responseTimes = attempts.map((a) => a.response_time_ms);
    const averageResponseTimeMs =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, ms) => sum + ms, 0) / responseTimes.length
        : null;

    const lastAttempt = attempts[attempts.length - 1];
    let consecutiveCorrect = 0;
    let consecutiveIncorrect = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].is_correct === lastAttempt.is_correct) {
        if (lastAttempt.is_correct) consecutiveCorrect++;
        else consecutiveIncorrect++;
      } else {
        break;
      }
    }

    return {
      itemsAttemptedInSession: attempts.length,
      consecutiveIncorrect,
      consecutiveCorrect,
      averageResponseTimeMs,
      hesitationEventCount: eventCounts.get('hesitation') ?? 0,
      retryEventCount: eventCounts.get('retry') ?? 0,
      idleGapCount: eventCounts.get('idle_gap') ?? 0,
    };
  }

  private mapAttempt(attempt: LessonAttemptRow): AimAttemptContextInput {
    return {
      attemptId: attempt.id,
      sessionId: attempt.learning_session_id,
      itemId: attempt.item_id,
      itemType: attempt.item_type as AimItemType,
      skillIds: attempt.skill_ids,
      presentedDifficulty: attempt.presented_difficulty as AimAttemptContextInput['presentedDifficulty'],
      studentAnswer: {
        format: attempt.answer_format as AimAnswerFormat,
        value: attempt.answer_value,
        optionsPresentedCount: attempt.options_presented_count,
      },
      isCorrect: attempt.is_correct,
      attemptNumberForItem: attempt.attempt_number_for_item,
      startedAt: attempt.started_at,
      submittedAt: attempt.submitted_at,
      responseTimeMs: attempt.response_time_ms,
      behavioralContext: {
        answerChangeCount: attempt.answer_change_count,
        hesitationBeforeSubmitMs: attempt.hesitation_before_submit_ms,
        usedHint: attempt.used_hint,
        abandonedFirstThenRetried: attempt.abandoned_first_then_retried,
      },
    };
  }
}
