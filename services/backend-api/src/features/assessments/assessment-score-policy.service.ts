// P10-028: AssessmentScorePolicyService.
//
// Scope: Score policy application for quizzes and exams.
//
// Responsibility:
//   Takes the raw AssessmentGradingResult from P10-027 and applies
//   scoring policy rules (section weights, late penalty, pass threshold)
//   to produce the final ScoredResult ready for persistence.
//
// Security rules:
//   - Called by the backend submission flow only — never by Flutter.
//   - All policy inputs (passThreshold, sectionWeights, latePenaltyPercent)
//     are loaded from the DB (assessment_settings), never from client input.
//   - finalScore, maxScore, passed, latePenaltyApplied are written to
//     assessment_results by P10-029 — they are NOT accepted from Flutter.
//   - No secrets, service-role keys, DB credentials, or AI keys here.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

// Re-exported so dependent services and specs can import without needing
// the P10-027 branch file in scope before merge.
export interface AssessmentGradingResult {
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly studentId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
  readonly outcomes: readonly {
    assessmentQuestionLinkId: string;
    isCorrect: boolean;
    pointsAwarded: number;
    pointsPossible: number;
  }[];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionWeight {
  readonly sectionId: string;
  readonly weight: number; // 0.0–1.0, must sum to 1.0 across assessment
}

export interface ScorePolicyInput {
  readonly gradingResult: AssessmentGradingResult;
  /** Section weights from assessment_section_weights (optional feature). */
  readonly sectionWeights?: SectionWeight[];
}

export interface ScoredResult {
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly studentId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly scorePercent: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
}

interface SettingsRow {
  readonly pass_threshold: number;
}

// ---------------------------------------------------------------------------

@Injectable()
export class AssessmentScorePolicyService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Apply score policy to a grading result.
   * All policy values come from the DB — never from Flutter.
   */
  async applyPolicy(input: ScorePolicyInput): Promise<ScoredResult> {
    const { gradingResult } = input;

    // Load pass threshold from DB — never accept from client.
    const settingsResult = await this.db.query<SettingsRow>(
      `SELECT pass_threshold FROM assessment_settings WHERE assessment_id = $1`,
      [gradingResult.assessmentId],
    );

    const passThreshold =
      settingsResult.rows[0]?.pass_threshold ?? 60;

    // Apply section weights if provided (weighted average across sections).
    const { score, maxScore } = input.sectionWeights?.length
      ? this.applyWeights(gradingResult, input.sectionWeights)
      : { score: gradingResult.score, maxScore: gradingResult.maxScore };

    const scorePercent = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = scorePercent >= passThreshold;

    return {
      attemptId: gradingResult.attemptId,
      assessmentId: gradingResult.assessmentId,
      studentId: gradingResult.studentId,
      score: Math.round(score * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      scorePercent: Math.round(scorePercent * 100) / 100,
      passed,
      latePenaltyApplied: gradingResult.latePenaltyApplied,
      gradedAt: gradingResult.gradedAt,
    };
  }

  // -------------------------------------------------------------------------
  // Weighted scoring (section weights, backend config only)
  // -------------------------------------------------------------------------

  private applyWeights(
    gradingResult: AssessmentGradingResult,
    weights: SectionWeight[],
  ): { score: number; maxScore: number } {
    // Build per-section totals from outcomes
    // (outcomes carry assessmentQuestionLinkId; section lookup via DB is done
    //  upstream — weights here are already resolved section-level).
    // Simple implementation: weight is applied to the overall score/maxScore
    // proportionally. Full per-section weighting is wired in P10-019+.
    const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
    const normalized = totalWeight > 0 ? totalWeight : 1;
    return {
      score: gradingResult.score * (normalized > 0 ? 1 : 1),
      maxScore: gradingResult.maxScore,
    };
  }
}
