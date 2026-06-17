// Phase 5 — P5-065
// AimPersistenceService — full wiring with transaction policy.
//
// Scope: Stage 6 of the backend AIM pipeline. Persists validated AIM Engine
//        response categories to the Phase 5 tables, wrapped in a single
//        PostgreSQL transaction so partial writes roll back atomically.
//
// Transaction policy (P5-065):
//   - All six category writes (skill state, weakness records, difficulty
//     decision, recommendations, review schedule, session summary) execute
//     within a single explicit PostgreSQL transaction (BEGIN … COMMIT).
//   - If any write fails, the transaction is rolled back in its entirety —
//     no partial AIM state is left in the database.
//   - Each category service is called with a TransactionScopedDb adapter so
//     all writes share the same pooled connection and therefore the same
//     transaction scope.
//   - Audit writes are intentionally excluded from the transaction: they
//     are append-only, best-effort, and must not cause a rollback.
//   - No two transactions race on the same (studentId, sessionId) pair
//     because the pipeline orchestrator is invoked sequentially per attempt.
//
// Backend authority rules:
//   - Receives input ONLY from the pipeline orchestrator — never from a client.
//   - Never persists an unvalidated AIM response.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { PoolClient, QueryResult, QueryResultRow } from 'pg';

import { DatabaseService } from '../../../database/database.service';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';
import { StudentSkillStateUpdateService } from './student-skill-state-update.service';
import { WeaknessUpdateService } from './weakness-update.service';
import { DifficultyDecisionService } from './difficulty-decision.service';
import { RecommendationOutputService } from './recommendation-output.service';
import { ReviewScheduleOutputService } from './review-schedule-output.service';
import { SessionSummaryService } from './session-summary.service';

// ---------------------------------------------------------------------------
// TransactionScopedDb
//
// Wraps a PoolClient to present the same .query() interface as DatabaseService.
// Passed to per-call service instances so all writes run in the same tx.
// ---------------------------------------------------------------------------

class TransactionScopedDb {
  constructor(private readonly client: PoolClient) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.client.query<T>(text, [...values]);
  }

  // withClient not needed inside a transaction; included for interface compat
  async withClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    return callback(this.client);
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AimPersistenceService {
  private readonly logger = new Logger(AimPersistenceService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly skillStateUpdate: StudentSkillStateUpdateService,
    private readonly weaknessUpdate: WeaknessUpdateService,
    private readonly difficultyDecision: DifficultyDecisionService,
    private readonly recommendationOutput: RecommendationOutputService,
    private readonly reviewScheduleOutput: ReviewScheduleOutputService,
    private readonly sessionSummary: SessionSummaryService,
  ) {}

  /**
   * Persist a fully validated AIM Engine response to the Phase 5 tables.
   *
   * All six category writes run within a single PostgreSQL transaction.
   * If any write fails, the entire transaction rolls back atomically.
   *
   * Throws on transaction failure so the orchestrator can record a
   * 'persistence_failed' audit entry and return ok: false.
   */
  async persist(validatedResponse: AimValidatedResponse): Promise<void> {
    const { studentId, categories } = validatedResponse;

    await this.db.withClient(async (client) => {
      const txDb = new TransactionScopedDb(client) as unknown as DatabaseService;

      // Scoped service instances that write through the tx connection
      const txSkillState = new StudentSkillStateUpdateService(txDb);
      const txWeakness = new WeaknessUpdateService(txDb);
      const txDifficulty = new DifficultyDecisionService(txDb);
      const txRecommendations = new RecommendationOutputService(txDb);
      const txReviewSchedule = new ReviewScheduleOutputService(txDb);
      const txSessionSummary = new SessionSummaryService(txDb);

      await client.query('BEGIN');

      try {
        // Category 1 — Skill state (P5-057)
        await txSkillState.upsertMany(studentId, categories.skillState);

        // Category 2 — Weakness records (P5-058)
        await txWeakness.upsertMany(studentId, categories.weaknessRecords);

        // Category 3 — Difficulty decision (P5-059)
        await txDifficulty.persist(studentId, categories.difficultyDecision);

        // Category 4 — Recommendations (P5-060)
        await txRecommendations.replaceActiveSet(studentId, categories.recommendations);

        // Category 5 — Review schedule (P5-061)
        await txReviewSchedule.upsertMany(studentId, categories.reviewSchedule);

        // Category 6 — Session summary (P5-063, includes P5-062 signal)
        await txSessionSummary.persist(studentId, categories.sessionSummary);

        await client.query('COMMIT');

        this.logger.log('aim_persistence_committed', {
          studentId,
          backendRequestId: validatedResponse.backendRequestId,
          sessionId: validatedResponse.sessionId,
        });
      } catch (err) {
        await client.query('ROLLBACK');

        this.logger.error('aim_persistence_rolled_back', {
          studentId,
          backendRequestId: validatedResponse.backendRequestId,
          sessionId: validatedResponse.sessionId,
          error: err instanceof Error ? err.message : String(err),
        });

        throw err;
      }
    });
  }
}
