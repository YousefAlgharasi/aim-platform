// P12-030: Create Parent Report Service
// Composes backend-approved weekly/monthly child report summaries from
// already-existing parent progress and assessment services.
//
// This service never computes mastery, weakness, score, correctness, or
// recommendations itself — it only counts and summarizes values already
// produced by ParentChildProgressService and ParentAssessmentSummaryService.
// Each section is only included if the parent currently holds the
// corresponding consent type; access is always resolved from
// ParentAccessPolicyService, never trusted from client input.

import { Injectable } from '@nestjs/common';

import { ParentChildReportEntity } from './dto/parent-child-report.entity';
import { ParentAccessPolicyService } from './parent-access-policy.service';
import { ParentChildProgressService } from './parent-child-progress.service';
import { ParentAssessmentSummaryService } from './parent-assessment-summary.service';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';

export type ParentReportType = 'weekly' | 'monthly';

@Injectable()
export class ParentReportService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly parentChildProgressService: ParentChildProgressService,
    private readonly parentAssessmentSummaryService: ParentAssessmentSummaryService,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  async getReportForParent(
    parentId: string,
    childId: string,
    reportType: ParentReportType,
  ): Promise<ParentChildReportEntity> {
    const scope = await this.parentAccessPolicyService.assertLinked(parentId, childId);

    const hasFullAccess = scope.grantedConsentTypes.includes('full_access');
    const hasProgressView =
      hasFullAccess || scope.grantedConsentTypes.includes('progress_view');
    const hasAssessmentView =
      hasFullAccess || scope.grantedConsentTypes.includes('assessment_view');

    const summaryParts: string[] = [];

    if (hasProgressView) {
      const progress = await this.parentChildProgressService.getProgressForParent(
        parentId,
        childId,
      );
      const openWeaknesses = progress.weaknesses.filter(
        (weakness) => weakness.status !== 'resolved',
      ).length;
      summaryParts.push(
        `${progress.skillStates.length} skills tracked, ${openWeaknesses} open weaknesses.`,
      );
    }

    if (hasAssessmentView) {
      const assessments = await this.parentAssessmentSummaryService.getAssessmentSummaryForParent(
        parentId,
        childId,
      );
      summaryParts.push(
        `${assessments.results.length} assessment results, ${assessments.upcomingAssessments.length} upcoming deadlines.`,
      );
    }

    if (summaryParts.length === 0) {
      summaryParts.push('No additional consent has been granted for detailed report data.');
    }

    const report = new ParentChildReportEntity();
    report.id = `${childId}-${reportType}-${Date.now()}`;
    report.parentId = parentId;
    report.childId = childId;
    report.reportType = reportType;
    report.generatedAt = new Date().toISOString();
    report.summary = summaryParts.join(' ');
    report.dataUrl = null;

    await this.analyticsEventIngestionService.ingest({
      eventType: 'parent.report_accessed',
      actorRole: 'parent',
      actorId: parentId,
      subjectType: 'parent_report',
      subjectId: report.id,
      metadata: { report_type: reportType },
    });

    return report;
  }
}
