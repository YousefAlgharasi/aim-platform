// P10-033: AssessmentController unit tests.
//
// Scope: Student Assessment List API only.
//
// Coverage:
//   - GET /student/assessments delegates to AssessmentService.listForStudent
//     with the authenticated user's id (never client-supplied).
//   - Response never includes pass_threshold/late_penalty_percent/weight/
//     correct_answer fields (verified by mock response shape contract).

import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentController } from './assessment.controller';
import { AssessmentService, AssessmentListItem, AssessmentDetailWithDeadline } from './assessment.service';
import { AttemptLifecycleService, StartAttemptResult } from './assessment-attempt.service';
import { AssessmentSubmissionFlowService, SubmitAttemptApiResult } from './assessment-submission-flow.service';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import { AssessmentAttemptOwnershipGuard } from './guards/assessment-attempt-ownership.guard';
import { AuthenticatedUser } from '../../auth/authenticated-user';

describe('AssessmentController', () => {
  let controller: AssessmentController;
  let assessmentService: jest.Mocked<Pick<AssessmentService, 'listForStudent' | 'getDetailWithDeadline'>>;
  let attemptLifecycleService: jest.Mocked<Pick<AttemptLifecycleService, 'startAttempt'>>;
  let submissionFlowService: jest.Mocked<Pick<AssessmentSubmissionFlowService, 'submitAndGrade'>>;

  const mockListItems: AssessmentListItem[] = [
    { id: 'assessment-1', type: 'quiz', title: 'Quiz 1', description: null, deadlineStatus: 'open' },
    { id: 'assessment-2', type: 'exam', title: 'Exam 1', description: 'Midterm', deadlineStatus: 'upcoming' },
  ];

  const mockDetail: AssessmentDetailWithDeadline = {
    id: 'assessment-1', type: 'quiz', title: 'Quiz 1', description: null,
    sections: [{ id: 'sec-1', title: 'Grammar', order: 1, questionCount: 10 }],
    maxAttempts: 2, timeLimitSeconds: 900,
    deadline: {
      deadlineId: 'd-1', opensAt: new Date(), closesAt: new Date(),
      extendedClosesAt: null, status: 'open',
    },
  };

  const mockStartAttemptResult: StartAttemptResult = {
    attemptId: 'att-1', assessmentId: 'assessment-1', attemptNumber: 1,
    status: 'started', startedAt: new Date(), expiresAt: null,
  };

  const mockSubmitAttemptResult: SubmitAttemptApiResult = {
    attemptId: 'att-1', status: 'graded', submittedAt: new Date(), resultId: 'result-1',
  };

  beforeEach(async () => {
    assessmentService = {
      listForStudent: jest.fn().mockResolvedValue(mockListItems),
      getDetailWithDeadline: jest.fn().mockResolvedValue(mockDetail),
    };
    attemptLifecycleService = {
      startAttempt: jest.fn().mockResolvedValue(mockStartAttemptResult),
    };
    submissionFlowService = {
      submitAndGrade: jest.fn().mockResolvedValue(mockSubmitAttemptResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentController],
      providers: [
        { provide: AssessmentService, useValue: assessmentService },
        { provide: AttemptLifecycleService, useValue: attemptLifecycleService },
        { provide: AssessmentSubmissionFlowService, useValue: submissionFlowService },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AssessmentPermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AssessmentAttemptOwnershipGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AssessmentController);
  });

  function makeUser(id: string): AuthenticatedUser {
    return { id, expiresAt: Date.now() + 3600, appMetadata: { role: 'student' } };
  }

  it('returns the assessment list resolved for the authenticated student id', async () => {
    const user = makeUser('student-1');
    const result = await controller.listAssessments(user);

    expect(assessmentService.listForStudent).toHaveBeenCalledWith('student-1');
    expect(result).toEqual(mockListItems);
  });

  it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
    const user = makeUser('student-from-jwt');
    await controller.listAssessments(user);

    expect(assessmentService.listForStudent).toHaveBeenCalledTimes(1);
    expect(assessmentService.listForStudent).toHaveBeenCalledWith('student-from-jwt');
  });

  it('response items expose no backend-only fields (pass_threshold, weight, correct_answer)', async () => {
    const user = makeUser('student-1');
    const result = await controller.listAssessments(user);

    for (const item of result) {
      expect(item).not.toHaveProperty('pass_threshold');
      expect(item).not.toHaveProperty('late_penalty_percent');
      expect(item).not.toHaveProperty('weight');
      expect(item).not.toHaveProperty('correct_answer');
    }
  });

  describe('getAssessmentDetail', () => {
    it('delegates to AssessmentService.getDetailWithDeadline with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.getAssessmentDetail('assessment-1', user);

      expect(assessmentService.getDetailWithDeadline).toHaveBeenCalledWith('assessment-1', 'student-1');
      expect(result).toEqual(mockDetail);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.getAssessmentDetail('assessment-2', user);

      expect(assessmentService.getDetailWithDeadline).toHaveBeenCalledTimes(1);
      expect(assessmentService.getDetailWithDeadline).toHaveBeenCalledWith('assessment-2', 'student-from-jwt');
    });

    it('response exposes no backend-only fields (pass_threshold, late_penalty_percent, weight, correct_answer)', async () => {
      const user = makeUser('student-1');
      const result = await controller.getAssessmentDetail('assessment-1', user) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('pass_threshold');
      expect(result).not.toHaveProperty('late_penalty_percent');
      expect(result).not.toHaveProperty('correct_answer');
      const sections = result['sections'] as Record<string, unknown>[];
      expect(sections[0]).not.toHaveProperty('weight');
    });
  });

  describe('startAttempt', () => {
    it('delegates to AttemptLifecycleService.startAttempt with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.startAttempt('assessment-1', user);

      expect(attemptLifecycleService.startAttempt).toHaveBeenCalledWith('assessment-1', 'student-1');
      expect(result).toEqual(mockStartAttemptResult);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.startAttempt('assessment-2', user);

      expect(attemptLifecycleService.startAttempt).toHaveBeenCalledTimes(1);
      expect(attemptLifecycleService.startAttempt).toHaveBeenCalledWith('assessment-2', 'student-from-jwt');
    });

    it('response exposes no backend-only fields (pass_threshold, late_penalty_percent, correct_answer)', async () => {
      const user = makeUser('student-1');
      const result = await controller.startAttempt('assessment-1', user) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('pass_threshold');
      expect(result).not.toHaveProperty('late_penalty_percent');
      expect(result).not.toHaveProperty('correct_answer');
    });
  });

  describe('submitAttempt', () => {
    it('delegates to AssessmentSubmissionFlowService.submitAndGrade with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.submitAttempt('att-1', user);

      expect(submissionFlowService.submitAndGrade).toHaveBeenCalledWith('att-1', 'student-1');
      expect(result).toEqual(mockSubmitAttemptResult);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.submitAttempt('att-2', user);

      expect(submissionFlowService.submitAndGrade).toHaveBeenCalledTimes(1);
      expect(submissionFlowService.submitAndGrade).toHaveBeenCalledWith('att-2', 'student-from-jwt');
    });

    it('response exposes no backend-only fields (score, maxScore, passed, latePenaltyApplied)', async () => {
      const user = makeUser('student-1');
      const result = await controller.submitAttempt('att-1', user) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('score');
      expect(result).not.toHaveProperty('maxScore');
      expect(result).not.toHaveProperty('passed');
      expect(result).not.toHaveProperty('latePenaltyApplied');
    });
  });
});
