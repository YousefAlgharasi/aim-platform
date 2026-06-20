// P12-028: Create Parent Assessment Summary Service
// Exposes a child's persisted assessment results and upcoming assessment
// deadlines to a linked, consented parent.
//
// This service never computes scores, pass/fail outcomes, late penalties,
// or deadline status — it only reads already-validated values from the
// existing Phase 10 assessment services and reshapes them into
// parent-facing entities. Access is always verified first via
// ParentAccessPolicyService.assertAccess('assessment_view'); no link or
// consent state is trusted from client input.
//
// AssessmentResultService only exposes results per-assessment
// (listByAssessment), so results across all of a child's assessments are
// gathered by first listing the child's assessments, then querying results
// per assessment and joining in the assessment title ourselves.

import { Injectable } from '@nestjs/common';

import { AssessmentService } from '../assessments/assessment.service';
import { AssessmentResultService } from '../assessments/assessment-result.service';
import { ParentAssessmentSummaryEntity } from './dto/parent-assessment-summary.entity';
import { ParentAccessPolicyService } from './parent-access-policy.service';

@Injectable()
export class ParentAssessmentSummaryService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly assessmentService: AssessmentService,
    private readonly assessmentResultService: AssessmentResultService,
  ) {}

  async getAssessmentSummaryForParent(
    parentId: string,
    childId: string,
  ): Promise<ParentAssessmentSummaryEntity> {
    await this.parentAccessPolicyService.assertAccess(parentId, childId, 'assessment_view');

    const assessments = await this.assessmentService.listForStudent(childId);
    const titleByAssessmentId = new Map(assessments.map((a) => [a.id, a.title]));

    const resultHistories = await Promise.all(
      assessments.map((a) => this.assessmentResultService.listByAssessment(a.id, childId)),
    );

    const deadlines = await this.assessmentService.listDeadlinesForStudent(childId);

    const summary = new ParentAssessmentSummaryEntity();
    summary.childId = childId;
    summary.retrievedAt = new Date().toISOString();

    summary.results = resultHistories.flatMap((history) =>
      history.results.map((entry) => ({
        resultId: entry.resultId,
        attemptId: entry.attemptId,
        assessmentId: history.assessmentId,
        assessmentTitle: titleByAssessmentId.get(history.assessmentId) ?? history.assessmentId,
        attemptNumber: entry.attemptNumber,
        score: entry.score,
        maxScore: entry.maxScore,
        passed: entry.passed,
        latePenaltyApplied: entry.latePenaltyApplied,
        gradedAt: entry.gradedAt.toISOString(),
        submittedAt: entry.submittedAt ? entry.submittedAt.toISOString() : null,
      })),
    );

    summary.upcomingAssessments = deadlines.upcoming.map((entry) => ({
      assessmentId: entry.assessmentId,
      assessmentTitle: entry.assessmentTitle,
      deadlineId: entry.deadlineId,
      opensAt: entry.opensAt.toISOString(),
      closesAt: entry.closesAt.toISOString(),
      extendedClosesAt: entry.extendedClosesAt ? entry.extendedClosesAt.toISOString() : null,
      status: entry.status,
    }));

    return summary;
  }
}
