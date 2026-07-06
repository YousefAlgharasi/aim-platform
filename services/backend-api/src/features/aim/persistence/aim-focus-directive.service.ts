// P20-013 — AimFocusDirectiveService.
//
// Scope: Generate and persist the AI Teacher's per-student "focus directive"
// (ai_focus_directives, P20-003) from the just-validated AIM Engine output
// categories for a pipeline run. This is the ONLY place directive_text is
// generated — a deterministic, template-based sentence built from real
// field values (skill, severity, rationale, reason), never an LLM call and
// never free-form generation. AI Teacher (ai-teacher/) only ever reads the
// resulting directive_text string via FocusDirectiveReadService /
// FocusDirectiveContextAdapter — it never computes one itself
// (docs/phase-18/ai-teacher-authority-rules.md).
//
// Priority when more than one candidate source exists this pipeline run
// (documented so a future reader doesn't need to reverse-engineer it):
//   1. Weakness records (status != 'resolved') — highest severity first
//      (critical > developing > emerging), tie-broken by earliest
//      detectedAt. This is the clearest "student is struggling" signal.
//   2. Difficulty decision, only when rationale = 'mastery_decrease' — a
//      decrease is the one difficulty outcome that itself indicates the
//      student needs extra support; 'mastery_increase' and
//      'consistent_performance' are positive/neutral and
//      'insufficient_data_hold' is inconclusive, so none of those produce a
//      directive.
//   3. The top-ranked (rank 1) recommendation, only when its reason is
//      'addresses_weakness' or 'review_due' — both are corrective/remedial
//      signals; 'reinforces_recent_skill' and 'next_in_sequence' are routine
//      forward progress and do not warrant a special focus directive.
//
// If none of the three produce a candidate, this pipeline run makes no
// change — any existing active directive is left as-is rather than cleared,
// since it may still be the most relevant guidance available.
//
// Backend authority rules:
//   - Called only from AimPersistenceService, after its six-category
//     transaction commits (best-effort, like AimAuditService — a failure
//     here must never roll back or fail the already-committed AIM write).
//   - Never accepts client input; studentId and all category data come
//     exclusively from the pipeline's already-validated AimValidatedResponse.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { SkillsService } from '../../curriculum/skills/skills.service';
import { UsersService } from '../../users/users.service';
import { StudentProfileService } from '../../students/student-profile.service';
import {
  AimValidatedCategories,
  AimValidatedDifficultyDecision,
  AimValidatedRecommendation,
  AimValidatedWeaknessRecord,
} from '../adapter/aim-response-mapper.types';

const WEAKNESS_SEVERITY_RANK: Record<AimValidatedWeaknessRecord['severity'], number> = {
  emerging: 1,
  developing: 2,
  critical: 3,
};

interface DirectiveCandidate {
  readonly skillId: string;
  readonly directiveText: string;
  readonly source: 'weakness_record' | 'recommendation' | 'difficulty_decision';
  readonly sourceId: string;
}

@Injectable()
export class AimFocusDirectiveService {
  private readonly logger = new Logger(AimFocusDirectiveService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly skills: SkillsService,
    private readonly users: UsersService,
    private readonly studentProfiles: StudentProfileService,
  ) {}

  async generateAndPersist(studentId: string, categories: AimValidatedCategories): Promise<void> {
    const candidate =
      (await this.fromWeaknessRecords(categories.weaknessRecords)) ??
      (await this.fromDifficultyDecision(categories.difficultyDecision)) ??
      (await this.fromRecommendations(categories.recommendations));

    if (!candidate) {
      return;
    }

    // ai_focus_directives.student_id is an FK to student_profiles(id) — a
    // third id space distinct from both the raw Supabase Auth UID used
    // throughout the AIM pipeline (this method's studentId parameter) and
    // the internal users.id. Resolve the full chain here, at the boundary
    // where the id crosses into this table's FK-enforced space.
    const user = await this.users.findBySupabaseUid(studentId);
    const profile = user ? await this.studentProfiles.findByUserId(user.id) : null;
    if (!profile) {
      this.logger.warn('ai_focus_directive_skipped_no_student_profile', { studentId });
      return;
    }
    const profileId = profile.id;

    await this.db.query(
      `UPDATE ai_focus_directives SET active = false WHERE student_id = $1 AND active = true`,
      [profileId],
    );

    await this.db.query(
      `INSERT INTO ai_focus_directives
         (student_id, skill_id, directive_text, source, source_id, generated_at, active)
       VALUES ($1, $2, $3, $4, $5, NOW(), true)`,
      [profileId, candidate.skillId, candidate.directiveText, candidate.source, candidate.sourceId],
    );

    this.logger.log('ai_focus_directive_generated', {
      studentId,
      skillId: candidate.skillId,
      source: candidate.source,
    });
  }

  private async fromWeaknessRecords(
    weaknessRecords: AimValidatedWeaknessRecord[],
  ): Promise<DirectiveCandidate | null> {
    const open = weaknessRecords.filter((w) => w.status !== 'resolved');
    if (open.length === 0) {
      return null;
    }

    const [chosen] = [...open].sort((a, b) => {
      const severityDiff = WEAKNESS_SEVERITY_RANK[b.severity] - WEAKNESS_SEVERITY_RANK[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
    });

    const skillLabel = await this.resolveSkillLabel(chosen.skillId);
    return {
      skillId: chosen.skillId,
      source: 'weakness_record',
      sourceId: chosen.weaknessId,
      directiveText:
        `The student is showing difficulty with ${skillLabel} (severity: ${chosen.severity}). ` +
        `Provide extra examples and check understanding before moving on.`,
    };
  }

  private async fromDifficultyDecision(
    difficultyDecision: AimValidatedDifficultyDecision | null,
  ): Promise<DirectiveCandidate | null> {
    if (!difficultyDecision || difficultyDecision.rationale !== 'mastery_decrease') {
      return null;
    }

    const skillLabel = await this.resolveSkillLabel(difficultyDecision.skillId);
    return {
      skillId: difficultyDecision.skillId,
      source: 'difficulty_decision',
      sourceId: difficultyDecision.decisionId,
      directiveText:
        `The student's difficulty level for ${skillLabel} was just reduced ` +
        `(from ${difficultyDecision.previousDifficulty} to ${difficultyDecision.nextDifficulty}) ` +
        `due to declining performance. Slow down, reinforce fundamentals, and confirm ` +
        `understanding before increasing pace again.`,
    };
  }

  private async fromRecommendations(
    recommendations: AimValidatedRecommendation[],
  ): Promise<DirectiveCandidate | null> {
    const topRanked = recommendations.find((r) => r.rank === 1);
    if (!topRanked) {
      return null;
    }

    const skillLabel = await this.resolveSkillLabel(topRanked.targetSkillId);

    if (topRanked.reason === 'addresses_weakness') {
      return {
        skillId: topRanked.targetSkillId,
        source: 'recommendation',
        sourceId: topRanked.recommendationId,
        directiveText:
          `The student's current recommended focus is ${skillLabel}, addressing a known ` +
          `weakness. Provide extra practice and check understanding before moving on.`,
      };
    }

    if (topRanked.reason === 'review_due') {
      return {
        skillId: topRanked.targetSkillId,
        source: 'recommendation',
        sourceId: topRanked.recommendationId,
        directiveText:
          `The student has a review item due for ${skillLabel}. Prioritize a quick review ` +
          `of this skill before introducing new material.`,
      };
    }

    return null;
  }

  /** Best-effort human-readable skill label; falls back to the raw skill id (never fabricated) if no match. */
  private async resolveSkillLabel(skillId: string): Promise<string> {
    try {
      const skill = await this.skills.getSkillByKey(skillId);
      return skill.title;
    } catch {
      return skillId;
    }
  }
}
