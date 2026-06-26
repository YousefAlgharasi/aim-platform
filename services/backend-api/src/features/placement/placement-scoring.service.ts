// Phase 4 — P4-045
// PlacementScoringService.
//
// Scope: Placement Test scoring only.
//
// Responsibility:
//   After PlacementAnswerValidationService (P4-044) has written is_correct on all
//   placement_answers for a submitted attempt, this service:
//
//   1. Computes per-section mastery scores (P4-031 §3).
//   2. Computes the overall weighted placement score (P4-031 §4).
//   3. Maps the score to an estimated CEFR level (P4-031 §5).
//   4. Computes per-skill correctness signals (P4-032 §4).
//   5. Builds the weakness map ranked list (P4-033).
//   6. Returns a PlacementScoringResult consumed by P4-046 (PlacementResultService).
//
// Call sequence:
//   P4-043 (complete) → P4-044 (validate) → P4-045 (score) → P4-046 (write result)
//
// Security rules:
//   - This service is called by the backend only — never triggered by Flutter.
//   - correct_answer values are never read here (already evaluated by P4-044).
//   - Raw scoring fields (overallScore, correctnessRatio, correctCount, lowCoverage,
//     skillKey) are NEVER returned to Flutter — they feed P4-046 only.
//   - Flutter receives only: estimatedLevel, skill signal per skill, weakness map
//     (skillCode/skillName/priority/signal) via the result API (P4-048).
//   - Section weights, signal thresholds, and level thresholds are backend config
//     constants — they are NOT stored in the DB and NOT exposed via any API.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  PlacementScoringResult,
  SectionScore,
  SkillMasteryMapEntry,
  SkillScore,
  WeaknessMapEntry,
} from './placement-scoring.types';

// ---------------------------------------------------------------------------
// Backend config constants — NOT stored in DB, NOT exposed via any API
// (P4-031 §2, P4-031 §3, P4-031 §5, P4-032 §4.2)
// ---------------------------------------------------------------------------

/** Section weights per P4-031 §2. Must sum to 1.0. */
const SECTION_WEIGHTS: Record<string, number> = {
  grammar: 0.30,
  vocabulary: 0.30,
  reading: 0.25,
  listening: 0.15,
};

/** Section weakness thresholds per P4-031 §3. */
const SECTION_WEAKNESS_THRESHOLDS: Record<string, number> = {
  grammar: 0.60,
  vocabulary: 0.60,
  reading: 0.55,
  listening: 0.55,
};

/** Skill signal thresholds per P4-032 §4.2. */
const SIGNAL_STRONG_THRESHOLD = 0.75;
const SIGNAL_DEVELOPING_THRESHOLD = 0.40;

/** Level thresholds per P4-031 §5. Evaluated highest-first. */
const LEVEL_THRESHOLDS: Array<{ min: number; level: PlacementScoringResult['estimatedLevel'] }> = [
  { min: 0.85, level: 'advanced' },
  { min: 0.70, level: 'upper_intermediate' },
  { min: 0.55, level: 'intermediate' },
  { min: 0.40, level: 'elementary' },
  { min: 0.00, level: 'beginner' },
];

// ---------------------------------------------------------------------------
// DB row types (internal)
// ---------------------------------------------------------------------------

interface AnswerRow {
  readonly skill_code: string;
  readonly is_correct: boolean | null;
}

interface SkillAnswerRow {
  readonly skill_id: string;
  readonly skill_key: string;
  readonly skill_name: string;
  readonly is_correct: boolean | null;
}

@Injectable()
export class PlacementScoringService {
  private readonly logger = new Logger(PlacementScoringService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Compute the full placement scoring result for a submitted attempt.
   *
   * Precondition: PlacementAnswerValidationService.validateAnswersForAttempt()
   * must have already run for this attemptId so is_correct is populated.
   *
   * @param attemptId  UUID of the submitted placement_attempt.
   * @returns          PlacementScoringResult for P4-046 to write to placement_results.
   */
  async scoreAttempt(attemptId: string): Promise<PlacementScoringResult> {
    // -----------------------------------------------------------------------
    // 1. Fetch all answers with their section skill_code.
    //    is_correct was set by P4-044. NULL answers (unanswered) treated as false.
    // -----------------------------------------------------------------------
    const answersResult = await this.db.query<AnswerRow>(
      `SELECT pa.skill_code, pa.is_correct
       FROM placement_answers pa
       WHERE pa.placement_attempt_id = $1`,
      [attemptId],
    );

    const answers = answersResult.rows;

    // -----------------------------------------------------------------------
    // 2. Compute per-section mastery scores (P4-031 §3).
    // -----------------------------------------------------------------------
    const sectionScores = this.computeSectionScores(answers);

    // -----------------------------------------------------------------------
    // 3. Compute overall weighted placement score (P4-031 §4).
    // -----------------------------------------------------------------------
    const overallScore = this.computeOverallScore(sectionScores);

    // -----------------------------------------------------------------------
    // 4. Map score to estimated CEFR level (P4-031 §5).
    // -----------------------------------------------------------------------
    const estimatedLevel = this.mapScoreToLevel(overallScore);

    // -----------------------------------------------------------------------
    // 5. Fetch per-skill answer data for skill scoring (P4-032 §4).
    //    Join placement_answers → placement_question_skills → skills.
    //    All linked skills (primary + secondary) contribute equally.
    // -----------------------------------------------------------------------
    const skillAnswersResult = await this.db.query<SkillAnswerRow>(
      `SELECT
         pqs.skill_id,
         s.key     AS skill_key,
         s.title   AS skill_name,
         pa.is_correct
       FROM placement_answers pa
       JOIN placement_question_skills pqs ON pqs.placement_question_id = pa.placement_question_id
       JOIN skills s ON s.id = pqs.skill_id
       WHERE pa.placement_attempt_id = $1`,
      [attemptId],
    );

    const skillAnswers = skillAnswersResult.rows;

    // -----------------------------------------------------------------------
    // 6. Compute per-skill signals (P4-032 §4).
    // -----------------------------------------------------------------------
    const skillScores = this.computeSkillScores(skillAnswers);

    // -----------------------------------------------------------------------
    // 7. Build skill_mastery_map entries.
    // -----------------------------------------------------------------------
    const skillMasteryMap = this.buildSkillMasteryMap(skillScores);

    // -----------------------------------------------------------------------
    // 8. Build weakness map (P4-033).
    // -----------------------------------------------------------------------
    const weaknessMap = this.buildWeaknessMap(sectionScores, skillScores);

    this.logger.log(
      `PlacementScoringService: attempt ${attemptId} — ` +
        `score=${overallScore.toFixed(3)}, level=${estimatedLevel}, ` +
        `skills=${skillScores.length}, weaknesses=${weaknessMap.length}`,
    );

    return {
      overallScore,
      estimatedLevel,
      sectionScores,
      skillScores,
      skillMasteryMap,
      weaknessMap,
    };
  }

  // -------------------------------------------------------------------------
  // Step 2: Section mastery scores (P4-031 §3)
  // -------------------------------------------------------------------------

  private computeSectionScores(answers: AnswerRow[]): SectionScore[] {
    // Group answers by skill_code (section)
    const bySection: Record<string, { correct: number; total: number }> = {};

    for (const answer of answers) {
      const code = answer.skill_code;
      if (!bySection[code]) {
        bySection[code] = { correct: 0, total: 0 };
      }
      bySection[code].total += 1;
      if (answer.is_correct === true) {
        bySection[code].correct += 1;
      }
    }

    const scores: SectionScore[] = [];

    for (const skillCode of Object.keys(SECTION_WEIGHTS)) {
      const data = bySection[skillCode] ?? { correct: 0, total: 0 };
      const masteryScore = data.total > 0 ? data.correct / data.total : 0;
      const threshold = SECTION_WEAKNESS_THRESHOLDS[skillCode] ?? 0.60;
      const isWeakness = masteryScore < threshold;
      const weaknessGap = isWeakness ? threshold - masteryScore : 0;

      scores.push({
        skillCode,
        correctAnswers: data.correct,
        totalQuestions: data.total,
        masteryScore,
        isWeakness,
        weaknessGap,
      });
    }

    return scores;
  }

  // -------------------------------------------------------------------------
  // Step 3: Overall weighted score (P4-031 §4)
  // -------------------------------------------------------------------------

  private computeOverallScore(sectionScores: SectionScore[]): number {
    let weighted = 0;
    for (const section of sectionScores) {
      const weight = SECTION_WEIGHTS[section.skillCode] ?? 0;
      weighted += section.masteryScore * weight;
    }
    // Clamp to [0.0, 1.0] to guard against floating point edge cases
    return Math.min(1.0, Math.max(0.0, weighted));
  }

  // -------------------------------------------------------------------------
  // Step 4: Level mapping (P4-031 §5)
  // -------------------------------------------------------------------------

  private mapScoreToLevel(score: number): PlacementScoringResult['estimatedLevel'] {
    for (const { min, level } of LEVEL_THRESHOLDS) {
      if (score >= min) return level;
    }
    return 'beginner';
  }

  // -------------------------------------------------------------------------
  // Step 6: Per-skill signals (P4-032 §4)
  // -------------------------------------------------------------------------

  private computeSkillScores(skillAnswers: SkillAnswerRow[]): SkillScore[] {
    // Group by skill_id
    const bySkill: Record<
      string,
      { skillKey: string; skillName: string; correct: number; total: number }
    > = {};

    for (const row of skillAnswers) {
      if (!bySkill[row.skill_id]) {
        bySkill[row.skill_id] = {
          skillKey: row.skill_key,
          skillName: row.skill_name,
          correct: 0,
          total: 0,
        };
      }
      bySkill[row.skill_id].total += 1;
      if (row.is_correct === true) {
        bySkill[row.skill_id].correct += 1;
      }
    }

    const scores: SkillScore[] = [];

    for (const [skillId, data] of Object.entries(bySkill)) {
      const correctnessRatio = data.total > 0 ? data.correct / data.total : 0;
      const signal = this.mapRatioToSignal(correctnessRatio, data.total);
      const lowCoverage = data.total < 2;

      scores.push({
        skillId,
        skillKey: data.skillKey,
        skillName: data.skillName,
        correctCount: data.correct,
        totalAnswered: data.total,
        correctnessRatio,
        signal,
        lowCoverage,
      });
    }

    return scores;
  }

  private mapRatioToSignal(
    ratio: number,
    totalAnswered: number,
  ): 'strong' | 'developing' | 'emerging' {
    if (totalAnswered === 0) return 'emerging';
    if (ratio >= SIGNAL_STRONG_THRESHOLD) return 'strong';
    if (ratio >= SIGNAL_DEVELOPING_THRESHOLD) return 'developing';
    return 'emerging';
  }

  // -------------------------------------------------------------------------
  // Step 7: Build skill_mastery_map JSONB
  // -------------------------------------------------------------------------

  private buildSkillMasteryMap(skillScores: SkillScore[]): SkillMasteryMapEntry[] {
    return skillScores.map((s) => ({
      skillId: s.skillId,
      skillKey: s.skillKey,
      skillName: s.skillName,
      signal: s.signal,
      correctCount: s.correctCount,
      totalAnswered: s.totalAnswered,
      correctnessRatio: s.correctnessRatio,
      lowCoverage: s.lowCoverage,
    }));
  }

  // -------------------------------------------------------------------------
  // Step 8: Build weakness map (P4-033)
  // -------------------------------------------------------------------------

  private buildWeaknessMap(
    sectionScores: SectionScore[],
    skillScores: SkillScore[],
  ): WeaknessMapEntry[] {
    const entries: WeaknessMapEntry[] = [];

    // Tier 1: section-level weaknesses, ordered by gap DESC (P4-033 §4.1 rule 1)
    const sectionWeaknesses = sectionScores
      .filter((s) => s.isWeakness)
      .sort((a, b) => b.weaknessGap - a.weaknessGap);

    for (const section of sectionWeaknesses) {
      entries.push({
        priority: 0, // will be set after sorting
        skillCode: section.skillCode,
        skillName: section.skillCode, // section-level: use code as name placeholder
        signal: 'emerging', // section-level weakness treated as emerging in map
        masteryScore: section.masteryScore,
        lowCoverage: false,
      });
    }

    // Tier 2: skill-level `emerging` signals (not already in section tier), ratio ASC
    const emergingSkills = skillScores
      .filter((s) => s.signal === 'emerging' && !s.lowCoverage)
      .sort((a, b) => a.correctnessRatio - b.correctnessRatio);

    for (const skill of emergingSkills) {
      entries.push({
        priority: 0,
        skillCode: skill.skillKey,
        skillName: skill.skillName,
        signal: 'emerging',
        masteryScore: skill.correctnessRatio,
        lowCoverage: false,
      });
    }

    // Tier 3: skill-level `developing` signals, ratio ASC
    const developingSkills = skillScores
      .filter((s) => s.signal === 'developing' && !s.lowCoverage)
      .sort((a, b) => a.correctnessRatio - b.correctnessRatio);

    for (const skill of developingSkills) {
      entries.push({
        priority: 0,
        skillCode: skill.skillKey,
        skillName: skill.skillName,
        signal: 'developing',
        masteryScore: skill.correctnessRatio,
        lowCoverage: false,
      });
    }

    // Tier 4: low-coverage weaknesses last (P4-033 §3.2)
    const lowCoverageWeaknesses = skillScores
      .filter(
        (s) =>
          s.lowCoverage &&
          (s.signal === 'emerging' || s.signal === 'developing'),
      )
      .sort((a, b) => a.correctnessRatio - b.correctnessRatio);

    for (const skill of lowCoverageWeaknesses) {
      entries.push({
        priority: 0,
        skillCode: skill.skillKey,
        skillName: skill.skillName,
        signal: skill.signal as 'emerging' | 'developing',
        masteryScore: skill.correctnessRatio,
        lowCoverage: true,
      });
    }

    // Assign 1-based priority
    return entries.map((entry, index) => ({ ...entry, priority: index + 1 }));
  }
}
