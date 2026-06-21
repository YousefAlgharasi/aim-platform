// P12-028: Create Parent Assessment Summary Service
// ParentAssessmentSummaryService unit tests.

import { ForbiddenException } from '@nestjs/common';

import { ParentAssessmentSummaryService } from './parent-assessment-summary.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function buildService(overrides: {
  assertAccess?: jest.Mock;
  assessments?: Array<Record<string, unknown>>;
  resultsByAssessment?: Record<string, Array<Record<string, unknown>>>;
  upcoming?: Array<Record<string, unknown>>;
} = {}) {
  const parentAccessPolicyService = {
    assertAccess: overrides.assertAccess ?? jest.fn().mockResolvedValue(undefined),
  };

  const assessments = overrides.assessments ?? [
    { id: 'assessment-1', type: 'quiz', title: 'Algebra Quiz', description: null, deadlineStatus: 'closed' },
  ];

  const assessmentService = {
    listForStudent: jest.fn().mockResolvedValue(assessments),
    listDeadlinesForStudent: jest.fn().mockResolvedValue({
      upcoming: overrides.upcoming ?? [],
      active: [],
      late: [],
      missed: [],
      closed: [],
    }),
  };

  const assessmentResultService = {
    listByAssessment: jest.fn().mockImplementation((assessmentId: string) =>
      Promise.resolve({
        assessmentId,
        totalAttempts: (overrides.resultsByAssessment?.[assessmentId] ?? []).length,
        results: overrides.resultsByAssessment?.[assessmentId] ?? [],
      }),
    ),
  };

  const service = new ParentAssessmentSummaryService(
    parentAccessPolicyService as never,
    assessmentService as never,
    assessmentResultService as never,
  );

  return {
    service,
    parentAccessPolicyService,
    assessmentService,
    assessmentResultService,
  };
}

describe('ParentAssessmentSummaryService', () => {
  it('verifies assessment_view access before reading any assessment data', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
      'assessment_view',
    );
  });

  it('propagates ForbiddenException from the access policy and never queries assessment services', async () => {
    const { service, assessmentService } = buildService({
      assertAccess: jest.fn().mockRejectedValue(new ForbiddenException('no access')),
    });

    await expect(service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(assessmentService.listForStudent).not.toHaveBeenCalled();
  });

  it('flattens per-assessment results and joins in the assessment title', async () => {
    const gradedAt = new Date('2026-06-01T00:00:00.000Z');
    const submittedAt = new Date('2026-05-31T23:00:00.000Z');

    const { service } = buildService({
      resultsByAssessment: {
        'assessment-1': [
          {
            resultId: 'result-1',
            attemptId: 'attempt-1',
            attemptNumber: 1,
            score: 8,
            maxScore: 10,
            passed: true,
            latePenaltyApplied: false,
            gradedAt,
            submittedAt,
          },
        ],
      },
    });

    const summary = await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.childId).toBe(CHILD_ID);
    expect(summary.results).toEqual([
      {
        resultId: 'result-1',
        attemptId: 'attempt-1',
        assessmentId: 'assessment-1',
        assessmentTitle: 'Algebra Quiz',
        attemptNumber: 1,
        score: 8,
        maxScore: 10,
        passed: true,
        latePenaltyApplied: false,
        gradedAt: gradedAt.toISOString(),
        submittedAt: submittedAt.toISOString(),
      },
    ]);
  });

  it('maps submittedAt to null when not submitted', async () => {
    const gradedAt = new Date('2026-06-01T00:00:00.000Z');

    const { service } = buildService({
      resultsByAssessment: {
        'assessment-1': [
          {
            resultId: 'result-1',
            attemptId: 'attempt-1',
            attemptNumber: 1,
            score: 8,
            maxScore: 10,
            passed: true,
            latePenaltyApplied: false,
            gradedAt,
            submittedAt: null,
          },
        ],
      },
    });

    const summary = await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.results[0].submittedAt).toBeNull();
  });

  it('maps upcoming deadlines into upcomingAssessments', async () => {
    const opensAt = new Date('2026-07-01T00:00:00.000Z');
    const closesAt = new Date('2026-07-08T00:00:00.000Z');

    const { service } = buildService({
      upcoming: [
        {
          assessmentId: 'assessment-2',
          assessmentTitle: 'Geometry Exam',
          deadlineId: 'deadline-1',
          opensAt,
          closesAt,
          extendedClosesAt: null,
          status: 'upcoming',
        },
      ],
    });

    const summary = await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.upcomingAssessments).toEqual([
      {
        assessmentId: 'assessment-2',
        assessmentTitle: 'Geometry Exam',
        deadlineId: 'deadline-1',
        opensAt: opensAt.toISOString(),
        closesAt: closesAt.toISOString(),
        extendedClosesAt: null,
        status: 'upcoming',
      },
    ]);
  });

  it('returns empty arrays when no results or upcoming deadlines exist', async () => {
    const { service } = buildService();

    const summary = await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.results).toEqual([]);
    expect(summary.upcomingAssessments).toEqual([]);
  });
});
