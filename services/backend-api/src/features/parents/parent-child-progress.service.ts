// P12-027: Create Parent Child Progress Service
// Exposes a child's persisted skill states, weakness records,
// recommendations, and review schedule to a linked, consented parent.
//
// This service never computes mastery, weakness, score, correctness,
// recommendations, or review schedules — it only reads already-validated
// values from the existing Phase 5 AIM read services and reshapes them
// into parent-facing entities. Access is always verified first via
// ParentAccessPolicyService.assertAccess('progress_view'); no link or
// consent state is trusted from client input.

import { Injectable } from '@nestjs/common';

import { StudentSkillStateReadService } from '../aim/result/student-skill-state-read.service';
import { WeaknessRecordsReadService } from '../aim/result/weakness-records-read.service';
import { RecommendationReadService } from '../aim/result/recommendation-read.service';
import { ReviewScheduleReadService } from '../aim/result/review-schedule-read.service';
import { ParentChildProgressEntity } from './dto/parent-child-progress.entity';
import { ParentAccessPolicyService } from './parent-access-policy.service';

@Injectable()
export class ParentChildProgressService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly studentSkillStateReadService: StudentSkillStateReadService,
    private readonly weaknessRecordsReadService: WeaknessRecordsReadService,
    private readonly recommendationReadService: RecommendationReadService,
    private readonly reviewScheduleReadService: ReviewScheduleReadService,
  ) {}

  async getProgressForParent(parentId: string, childId: string): Promise<ParentChildProgressEntity> {
    await this.parentAccessPolicyService.assertAccess(parentId, childId, 'progress_view');

    const [skillStates, weaknessRecords, recommendations, reviewSchedules] = await Promise.all([
      this.studentSkillStateReadService.getSkillStatesForStudent(childId),
      this.weaknessRecordsReadService.getWeaknessRecordsForStudent(childId),
      this.recommendationReadService.getActiveForStudent(childId),
      this.reviewScheduleReadService.getReviewSchedulesForStudent(childId),
    ]);

    const progress = new ParentChildProgressEntity();
    progress.childId = childId;
    progress.retrievedAt = new Date().toISOString();

    progress.skillStates = skillStates.skillStates.map((entry) => ({
      skillId: entry.skillId,
      masteryScore: entry.masteryScore,
      masteryConfidence: entry.masteryConfidence,
      masteryTrend: entry.masteryTrend,
      lastEvaluatedAt: entry.lastEvaluatedAt,
    }));

    progress.weaknesses = weaknessRecords.weaknessRecords.map((entry) => ({
      weaknessId: entry.weaknessId,
      skillId: entry.skillId,
      severity: entry.severity,
      status: entry.status,
      detectedAt: entry.detectedAt,
      resolvedAt: entry.resolvedAt,
    }));

    progress.recommendations = recommendations.recommendations.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      targetSkillId: entry.targetSkillId,
      rank: entry.rank,
      reason: entry.reason,
      generatedAt: entry.generatedAt,
      status: entry.status,
    }));

    progress.reviewSchedules = reviewSchedules.reviewSchedules.map((entry) => ({
      scheduleId: entry.scheduleId,
      skillId: entry.skillId,
      dueAt: entry.dueAt,
      status: entry.status,
    }));

    return progress;
  }
}
