// Phase 5 — P5-059
// DifficultyDecisionService.
//
// Scope: Persist AIM Engine difficulty decision outputs (nextDifficulty,
//        previousDifficulty, rationale) to the difficulty_decisions table
//        (P5-037). Implements the update rules defined in P5-014.
//
// Responsibility:
//   Receives a validated AimValidatedDifficultyDecision (optional) from the
//   pipeline orchestrator (P5-056) and upserts one row per (student_id,
//   skill_id) pair using an INSERT … ON CONFLICT DO UPDATE pattern.
//
//   Additional contract invariants validated here (defense-in-depth on top
//   of the adapter's Stage-5 validation):
//     1. Step constraint: |nextDifficulty - previousDifficulty| <= 1.
//        (Also enforced by the DB CHECK constraint; validated here to surface
//        a typed audit event before the write attempt.)
//     2. Stale-decision guard: when an existing row is found, the incoming
//        previousDifficulty must match the persisted currentDifficulty. A
//        mismatch means the AIM Engine's view of the prior state is stale;
//        the Backend holds the existing decision and records an audit event.
//     3. No speed or response-time value is accepted or computed here.
//
// Backend authority rules enforced here:
//   - studentId is always sourced from the pipeline context (JWT-resolved),
//     never from a client payload.
//   - nextDifficulty / rationale come exclusively from the validated AIM
//     Engine response (P5-048 mapped and validated before reaching here).
//   - The Backend never computes nextDifficulty itself.
//   - No AIM Engine call is made here; features/aim/persistence never
//     talks to the AIM Engine. Only the adapter (P5-051) does.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedDifficultyDecision } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shape
// ---------------------------------------------------------------------------

interface DifficultyDecisionCurrentRow {
  readonly current_difficulty: number;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type DifficultyDecisionPersistOutcome =
  | { readonly ok: true; readonly action: 'inserted' | 'updated' | 'skipped_null' }
  | { readonly ok: false; readonly reason: DifficultyDecisionSkipReason };

export type DifficultyDecisionSkipReason =
  | 'step_constraint_violated'
  | 'stale_decision'
  | 'empty_skill_id'
  | 'empty_decision_id';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class DifficultyDecisionService {
  private readonly logger = new Logger(DifficultyDecisionService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist a validated difficulty decision from the AIM Engine.
   *
   * If decision is null/undefined (the AIM Engine omitted difficultyDecision
   * for this call), the existing row for the affected skill is left
   * unchanged and the outcome is ok=true / action='skipped_null'. The
   * Backend's content-selection logic continues using the last persisted
   * currentDifficulty per the P5-014 update rules.
   *
   * studentId must be JWT-resolved by the pipeline orchestrator — never
   * accepted from a client payload.
   *
   * Returns a typed outcome for use by the persistence coordinator (P5-064
   * audit log, P5-056 orchestrator).
   */
  async persist(
    studentId: string,
    decision: AimValidatedDifficultyDecision | null | undefined,
  ): Promise<DifficultyDecisionPersistOutcome> {
    if (!decision) {
      this.logger.debug('difficulty_decision_skipped_null', { studentId });
      return { ok: true, action: 'skipped_null' };
    }

    // -----------------------------------------------------------------------
    // Defensive guards (defense-in-depth on top of adapter validation)
    // -----------------------------------------------------------------------

    if (!decision.decisionId || decision.decisionId.trim().length === 0) {
      this.logger.warn('difficulty_decision_skipped_empty_decision_id', {
        studentId,
        skillId: decision.skillId,
      });
      return { ok: false, reason: 'empty_decision_id' };
    }

    if (!decision.skillId || decision.skillId.trim().length === 0) {
      this.logger.warn('difficulty_decision_skipped_empty_skill_id', {
        studentId,
        decisionId: decision.decisionId,
      });
      return { ok: false, reason: 'empty_skill_id' };
    }

    // Step constraint: |nextDifficulty - previousDifficulty| <= 1
    const step = Math.abs(decision.nextDifficulty - decision.previousDifficulty);
    if (step > 1) {
      this.logger.warn('difficulty_decision_step_constraint_violated', {
        studentId,
        skillId: decision.skillId,
        decisionId: decision.decisionId,
        nextDifficulty: decision.nextDifficulty,
        previousDifficulty: decision.previousDifficulty,
        step,
      });
      return { ok: false, reason: 'step_constraint_violated' };
    }

    // -----------------------------------------------------------------------
    // Stale-decision guard (P5-014 Update Rules §3)
    // -----------------------------------------------------------------------

    const existing = await this.db.query<DifficultyDecisionCurrentRow>(
      `SELECT current_difficulty
         FROM difficulty_decisions
        WHERE student_id = $1 AND skill_id = $2
        LIMIT 1`,
      [studentId, decision.skillId],
    );

    const rowExists = (existing.rowCount ?? 0) > 0;

    if (rowExists) {
      const persistedCurrentDifficulty = existing.rows[0].current_difficulty;
      if (persistedCurrentDifficulty !== decision.previousDifficulty) {
        this.logger.warn('difficulty_decision_stale_decision', {
          studentId,
          skillId: decision.skillId,
          decisionId: decision.decisionId,
          persistedCurrentDifficulty,
          incomingPreviousDifficulty: decision.previousDifficulty,
        });
        return { ok: false, reason: 'stale_decision' };
      }
    }

    // -----------------------------------------------------------------------
    // Upsert
    // -----------------------------------------------------------------------

    await this.db.query(
      `INSERT INTO difficulty_decisions (
         id, student_id, skill_id,
         current_difficulty, previous_difficulty,
         rationale, based_on_attempt_ids,
         decided_at,
         created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, now(), now())
       ON CONFLICT (student_id, skill_id) DO UPDATE
         SET id                   = EXCLUDED.id,
             current_difficulty   = EXCLUDED.current_difficulty,
             previous_difficulty  = EXCLUDED.previous_difficulty,
             rationale            = EXCLUDED.rationale,
             based_on_attempt_ids = EXCLUDED.based_on_attempt_ids,
             decided_at           = EXCLUDED.decided_at,
             updated_at           = now()`,
      [
        decision.decisionId,
        studentId,
        decision.skillId,
        decision.nextDifficulty,
        decision.previousDifficulty,
        decision.rationale,
        JSON.stringify(decision.basedOnAttemptIds),
        decision.decidedAt,
      ],
    );

    const action = rowExists ? 'updated' : 'inserted';

    this.logger.log('difficulty_decision_persisted', {
      studentId,
      skillId: decision.skillId,
      decisionId: decision.decisionId,
      nextDifficulty: decision.nextDifficulty,
      rationale: decision.rationale,
      action,
    });

    return { ok: true, action };
  }
}
