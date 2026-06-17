/**
 * AIM persistence service — Phase 5 (P5-043 skeleton; fully wired in P5-058
 * follow-up).
 *
 * Owns Stage 6 of the backend AIM pipeline: persists validated AIM Engine
 * response categories to the Phase 5 tables.
 *
 * Wiring history:
 *   P5-057, P5-059, P5-060, P5-061, P5-063 each implemented and tested a
 *   persistence service for one category, but none of them were called from
 *   this orchestration point — this service remained a stub that only
 *   logged a warning. Discovered and fixed while implementing P5-058
 *   (Weakness Update Service); all six categories are now wired here in the
 *   same pass since the fix is a small, additive set of method calls with
 *   no new business logic (each underlying service is already implemented
 *   and independently tested).
 *
 * Deliberately NOT wired: FrustrationSignalService (P5-062). Its own
 * docstring states it "writes the same row" as SessionSummaryService
 * (P5-063) and "may be superseded or composed by P5-063" — calling both
 * here would double-write session_summaries from two independent code
 * paths. SessionSummaryService is treated as the canonical owner per its
 * docstring; FrustrationSignalService is left unwired and flagged in the
 * P5-058 completion comment as likely-dead code pending a team decision.
 *
 * Scope rules:
 * - This service accepts input ONLY from the pipeline orchestrator.
 * - It never accepts client-submitted values for any AIM-owned field.
 * - It never persists an unvalidated AIM response.
 * - Persistence is transactional per AIM response — partial writes roll back
 *   (full transaction wrapping owned by P5-065; not yet applied here — each
 *   category currently persists independently, so a failure partway through
 *   can leave a partial write across categories until P5-065 lands).
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';
import { WeaknessUpdateService } from './weakness-update.service';
import { StudentSkillStateUpdateService } from './student-skill-state-update.service';
import { DifficultyDecisionService } from './difficulty-decision.service';
import { RecommendationOutputService } from './recommendation-output.service';
import { ReviewScheduleOutputService } from './review-schedule-output.service';
import { SessionSummaryService } from './session-summary.service';

@Injectable()
export class AimPersistenceService {
  private readonly logger = new Logger(AimPersistenceService.name);

  constructor(
    private readonly weaknessUpdate: WeaknessUpdateService,
    private readonly skillStateUpdate: StudentSkillStateUpdateService,
    private readonly difficultyDecision: DifficultyDecisionService,
    private readonly recommendationOutput: RecommendationOutputService,
    private readonly reviewScheduleOutput: ReviewScheduleOutputService,
    private readonly sessionSummary: SessionSummaryService,
  ) {}

  /**
   * Persist a fully validated AIM Engine response to the Phase 5 tables.
   *
   * Each category is persisted independently via its own already-tested
   * service. studentId is taken from the validated response envelope,
   * which the orchestrator (P5-056) resolved from the authenticated
   * pipeline context — never from a client payload.
   */
  async persist(validatedResponse: AimValidatedResponse): Promise<void> {
    const { studentId, categories } = validatedResponse;

    if (categories.skillState.length > 0) {
      await this.skillStateUpdate.upsertMany(studentId, categories.skillState);
    }

    if (categories.weaknessRecords.length > 0) {
      await this.weaknessUpdate.upsertMany(studentId, categories.weaknessRecords);
    }

    await this.difficultyDecision.persist(studentId, categories.difficultyDecision);

    await this.recommendationOutput.replaceActiveSet(studentId, categories.recommendations);

    await this.reviewScheduleOutput.upsertMany(studentId, categories.reviewSchedule);

    await this.sessionSummary.persist(studentId, categories.sessionSummary);

    this.logger.log('aim_persistence_completed', {
      studentId,
      skillStateCount: categories.skillState.length,
      weaknessRecordCount: categories.weaknessRecords.length,
      hasDifficultyDecision: categories.difficultyDecision !== null,
      recommendationCount: categories.recommendations.length,
      reviewScheduleCount: categories.reviewSchedule.length,
      hasSessionSummary: categories.sessionSummary !== null,
    });
  }
}
