// P12-030: Create Parent Report Service
// ParentReportService unit tests.

import { ForbiddenException } from '@nestjs/common';

import { ParentReportService } from './parent-report.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function buildService(overrides: {
  assertLinked?: jest.Mock;
  grantedConsentTypes?: string[];
  skillStates?: Array<Record<string, unknown>>;
  weaknesses?: Array<Record<string, unknown>>;
  results?: Array<Record<string, unknown>>;
  upcomingAssessments?: Array<Record<string, unknown>>;
} = {}) {
  const parentAccessPolicyService = {
    assertLinked:
      overrides.assertLinked ??
      jest.fn().mockResolvedValue({
        linkStatus: 'active',
        grantedConsentTypes: overrides.grantedConsentTypes ?? ['progress_view', 'assessment_view'],
      }),
  };

  const parentChildProgressService = {
    getProgressForParent: jest.fn().mockResolvedValue({
      childId: CHILD_ID,
      skillStates: overrides.skillStates ?? [],
      weaknesses: overrides.weaknesses ?? [],
      recommendations: [],
      reviewSchedules: [],
      retrievedAt: new Date().toISOString(),
    }),
  };

  const parentAssessmentSummaryService = {
    getAssessmentSummaryForParent: jest.fn().mockResolvedValue({
      childId: CHILD_ID,
      results: overrides.results ?? [],
      upcomingAssessments: overrides.upcomingAssessments ?? [],
      retrievedAt: new Date().toISOString(),
    }),
  };

  const service = new ParentReportService(
    parentAccessPolicyService as never,
    parentChildProgressService as never,
    parentAssessmentSummaryService as never,
  );

  return {
    service,
    parentAccessPolicyService,
    parentChildProgressService,
    parentAssessmentSummaryService,
  };
}

describe('ParentReportService', () => {
  it('verifies an active link before reading any report data', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getReportForParent(PARENT_ID, CHILD_ID, 'weekly');

    expect(parentAccessPolicyService.assertLinked).toHaveBeenCalledWith(PARENT_ID, CHILD_ID);
  });

  it('propagates ForbiddenException from the access policy and never queries report data', async () => {
    const { service, parentChildProgressService, parentAssessmentSummaryService } = buildService({
      assertLinked: jest.fn().mockRejectedValue(new ForbiddenException('no link')),
    });

    await expect(
      service.getReportForParent(PARENT_ID, CHILD_ID, 'weekly'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(parentChildProgressService.getProgressForParent).not.toHaveBeenCalled();
    expect(parentAssessmentSummaryService.getAssessmentSummaryForParent).not.toHaveBeenCalled();
  });

  it('includes a progress section only when progress_view consent is granted', async () => {
    const { service, parentChildProgressService } = buildService({
      grantedConsentTypes: ['progress_view'],
    });

    const report = await service.getReportForParent(PARENT_ID, CHILD_ID, 'weekly');

    expect(parentChildProgressService.getProgressForParent).toHaveBeenCalledWith(PARENT_ID, CHILD_ID);
    expect(report.summary).toContain('skills tracked');
  });

  it('includes an assessment section only when assessment_view consent is granted', async () => {
    const { service, parentAssessmentSummaryService } = buildService({
      grantedConsentTypes: ['assessment_view'],
    });

    const report = await service.getReportForParent(PARENT_ID, CHILD_ID, 'monthly');

    expect(parentAssessmentSummaryService.getAssessmentSummaryForParent).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
    );
    expect(report.summary).toContain('assessment results');
  });

  it('treats full_access consent as granting both sections', async () => {
    const { service, parentChildProgressService, parentAssessmentSummaryService } = buildService({
      grantedConsentTypes: ['full_access'],
    });

    await service.getReportForParent(PARENT_ID, CHILD_ID, 'weekly');

    expect(parentChildProgressService.getProgressForParent).toHaveBeenCalled();
    expect(parentAssessmentSummaryService.getAssessmentSummaryForParent).toHaveBeenCalled();
  });

  it('falls back to a no-consent message when no relevant consent is granted', async () => {
    const { service } = buildService({ grantedConsentTypes: [] });

    const report = await service.getReportForParent(PARENT_ID, CHILD_ID, 'weekly');

    expect(report.summary).toBe('No additional consent has been granted for detailed report data.');
  });

  it('counts only unresolved weaknesses as open', async () => {
    const { service } = buildService({
      grantedConsentTypes: ['progress_view'],
      skillStates: [{ skillId: 's1' }, { skillId: 's2' }],
      weaknesses: [
        { weaknessId: 'w1', status: 'open' },
        { weaknessId: 'w2', status: 'resolved' },
      ],
    });

    const report = await service.getReportForParent(PARENT_ID, CHILD_ID, 'weekly');

    expect(report.summary).toContain('2 skills tracked, 1 open weaknesses.');
  });

  it('populates the report entity with childId, parentId, reportType, and a null dataUrl', async () => {
    const { service } = buildService();

    const report = await service.getReportForParent(PARENT_ID, CHILD_ID, 'monthly');

    expect(report.parentId).toBe(PARENT_ID);
    expect(report.childId).toBe(CHILD_ID);
    expect(report.reportType).toBe('monthly');
    expect(report.dataUrl).toBeNull();
    expect(typeof report.generatedAt).toBe('string');
    expect(typeof report.id).toBe('string');
  });
});
