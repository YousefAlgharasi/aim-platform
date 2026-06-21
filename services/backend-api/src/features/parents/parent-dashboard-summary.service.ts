// P12-026: Create Parent Dashboard Summary Service
// Aggregates backend-approved, already-computed child data into the parent
// dashboard home view. This service never calculates mastery, weakness,
// score, correctness, recommendations, or any AIM/assessment output — it
// only selects and reshapes values that other backend services have
// already produced (skill state trend, weakness record status, deadline
// buckets), and only for children the parent currently has an active,
// consent-aware link to.

import { Injectable } from '@nestjs/common';

import { StudentSkillStateReadService } from '../aim/result/student-skill-state-read.service';
import { WeaknessRecordsReadService } from '../aim/result/weakness-records-read.service';
import { AssessmentService } from '../assessments/assessment.service';
import { StudentsService } from '../students/students.service';
import {
  ParentDashboardChildSummaryDto,
  ParentDashboardSummaryDto,
} from './dto/parent-dashboard-summary.dto';
import { ParentConsentService } from './parent-consent.service';
import { ParentAccessPolicyService } from './parent-access-policy.service';

@Injectable()
export class ParentDashboardSummaryService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly parentConsentService: ParentConsentService,
    private readonly studentsService: StudentsService,
    private readonly studentSkillStateReadService: StudentSkillStateReadService,
    private readonly weaknessRecordsReadService: WeaknessRecordsReadService,
    private readonly assessmentService: AssessmentService,
  ) {}

  async getSummaryForParent(parentId: string): Promise<ParentDashboardSummaryDto> {
    const childIds = await this.parentAccessPolicyService.listAccessibleChildIds(parentId);

    const children = await Promise.all(
      childIds.map((childId) => this.buildChildSummary(parentId, childId)),
    );

    const summary = new ParentDashboardSummaryDto();
    summary.parentId = parentId;
    summary.children = children;

    return summary;
  }

  private async buildChildSummary(
    parentId: string,
    childId: string,
  ): Promise<ParentDashboardChildSummaryDto> {
    const scope = await this.parentConsentService.resolveAccessScope(parentId, childId);
    const grantedConsentTypes = scope?.grantedConsentTypes ?? [];
    const hasProgressConsent =
      grantedConsentTypes.includes('progress_view') || grantedConsentTypes.includes('full_access');
    const hasAssessmentConsent =
      grantedConsentTypes.includes('assessment_view') || grantedConsentTypes.includes('full_access');

    const studentProfile = await this.studentsService.findByUserId(childId);

    const child = new ParentDashboardChildSummaryDto();
    child.childId = childId;
    child.displayName = studentProfile?.displayName ?? childId;
    child.lastUpdatedAt = new Date().toISOString();
    child.progressLabel = null;
    child.hasOpenWeaknesses = null;
    child.upcomingDeadlineCount = null;

    if (hasProgressConsent) {
      const [skillStates, weaknessRecords] = await Promise.all([
        this.studentSkillStateReadService.getSkillStatesForStudent(childId),
        this.weaknessRecordsReadService.getWeaknessRecordsForStudent(childId),
      ]);

      child.progressLabel = this.resolveProgressLabel(skillStates.skillStates);
      child.hasOpenWeaknesses = weaknessRecords.weaknessRecords.some(
        (record) => record.status === 'open',
      );
    }

    if (hasAssessmentConsent) {
      const deadlines = await this.assessmentService.listDeadlinesForStudent(childId);
      child.upcomingDeadlineCount = deadlines.upcoming.length;
    }

    return child;
  }

  /**
   * Passes through the most recently evaluated skill's backend-computed
   * mastery trend as the display label. No new trend/score is derived here.
   */
  private resolveProgressLabel(
    skillStates: ReadonlyArray<{ readonly masteryTrend: string; readonly lastEvaluatedAt: string }>,
  ): string | null {
    if (skillStates.length === 0) {
      return null;
    }

    const mostRecent = skillStates.reduce((latest, current) =>
      current.lastEvaluatedAt > latest.lastEvaluatedAt ? current : latest,
    );

    return mostRecent.masteryTrend;
  }
}
