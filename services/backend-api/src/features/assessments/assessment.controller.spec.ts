// P10-033 / P10-040: AssessmentController unit tests.
//
// Coverage:
//   - GET /student/assessments delegates to AssessmentService.listForStudent
//     with the authenticated user's id (never client-supplied).
//   - GET /student/assessments/:id/history delegates to
//     AssessmentResultService.listByAssessment (P10-040).
//   - Response never includes pass_threshold/late_penalty_percent/weight/
//     correct_answer fields (verified by mock response shape contract).

import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentController } from './assessment.controller';
import {
  AssessmentService,
  AssessmentListItem,
  AssessmentDetailWithDeadline,
  StudentDeadlinesResponse,
} from './assessment.service';
import { AttemptLifecycleService, StartAttemptResult, ResumeAttemptResult } from './assessment-attempt.service';
import { AssessmentSubmissionFlowService, SubmitAttemptApiResult } from './assessment-submission-flow.service';
import { AssessmentFeedbackService, FeedbackSummary } from './assessment-feedback.service';
import { AssessmentResultService, ResultHistoryResponse } from './assessment-result.service';
import { QuestionDeliveryService, DeliveredQuestion } from './question-delivery.service';
import { AnswerSubmissionService, SubmittedAnswerDto } from './answer-submission.service';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import { AssessmentAttemptOwnershipGuard } from './guards/assessment-attempt-ownership.guard';
import { AssessmentResultOwnershipGuard } from './guards/assessment-result-ownership.guard';
import { AuthenticatedUser } from '../../auth/authenticated-user';

describe('AssessmentController', () => {
  let controller: AssessmentController;
  let assessmentService: jest.Mocked<Pick<AssessmentService, 'listForStudent' | 'getDetailWithDeadline' | 'listDeadlinesForStudent'>>;
  let attemptLifecycleService: jest.Mocked<Pick<AttemptLifecycleService, 'startAttempt' | 'resumeAttempt'>>;
  let submissionFlowService: jest.Mocked<Pick<AssessmentSubmissionFlowService, 'submitAndGrade'>>;
  let feedbackService: jest.Mocked<Pick<AssessmentFeedbackService, 'getFeedback'>>;
  let resultService: jest.Mocked<Pick<AssessmentResultService, 'listByAssessment'>>;
  let questionDeliveryService: jest.Mocked<Pick<QuestionDeliveryService, 'getQuestionsForAttempt'>>;
  let answerSubmissionService: jest.Mocked<Pick<AnswerSubmissionService, 'submitAnswer'>>;

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

  const mockDeadlinesResponse: StudentDeadlinesResponse = {
    upcoming: [],
    active: [{
      assessmentId: 'assessment-1', assessmentTitle: 'Quiz 1', deadlineId: 'd-1',
      opensAt: new Date(), closesAt: new Date(), extendedClosesAt: null, status: 'open',
    }],
    late: [], missed: [], closed: [],
  };

  const mockResultHistory: ResultHistoryResponse = {
    assessmentId: 'assessment-1',
    totalAttempts: 1,
    results: [{
      resultId: 'result-1', attemptId: 'att-1', attemptNumber: 1,
      score: 8, maxScore: 10, passed: true, latePenaltyApplied: false,
      gradedAt: new Date(), submittedAt: new Date(),
    }],
  };

  const mockFeedbackSummary: FeedbackSummary = {
    resultId: 'result-1', attemptId: 'att-1', score: 8, maxScore: 10, passed: true,
    latePenaltyApplied: false, gradedAt: new Date(), feedbackAllowed: true,
    breakdown: [{ assessmentQuestionLinkId: 'q-1', sectionId: 'sec-1', pointsAwarded: 1, pointsPossible: 1, isCorrect: true }],
  };

  beforeEach(async () => {
    assessmentService = {
      listForStudent: jest.fn().mockResolvedValue(mockListItems),
      getDetailWithDeadline: jest.fn().mockResolvedValue(mockDetail),
      listDeadlinesForStudent: jest.fn().mockResolvedValue(mockDeadlinesResponse),
    };
    attemptLifecycleService = {
      startAttempt: jest.fn().mockResolvedValue(mockStartAttemptResult),
      resumeAttempt: jest.fn().mockResolvedValue({ attemptId: 'att-1', status: 'in_progress', expiresAt: null } as ResumeAttemptResult),
    };
    submissionFlowService = {
      submitAndGrade: jest.fn().mockResolvedValue(mockSubmitAttemptResult),
    };
    feedbackService = {
      getFeedback: jest.fn().mockResolvedValue(mockFeedbackSummary),
    };
    resultService = {
      listByAssessment: jest.fn().mockResolvedValue(mockResultHistory),
    };
    questionDeliveryService = {
      getQuestionsForAttempt: jest.fn().mockResolvedValue([
        { id: 'q-1', assessmentQuestionLinkId: 'link-1', sectionId: null, order: 1, type: 'mcq', prompt: 'Prompt?', options: [] },
      ] as DeliveredQuestion[]),
    };
    answerSubmissionService = {
      submitAnswer: jest.fn().mockResolvedValue({
        answerId: 'answer-1', assessmentQuestionLinkId: 'link-1', submittedAt: new Date(),
      } as SubmittedAnswerDto),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentController],
      providers: [
        { provide: AssessmentService, useValue: assessmentService },
        { provide: AttemptLifecycleService, useValue: attemptLifecycleService },
        { provide: AssessmentSubmissionFlowService, useValue: submissionFlowService },
        { provide: AssessmentFeedbackService, useValue: feedbackService },
        { provide: AssessmentResultService, useValue: resultService },
        { provide: QuestionDeliveryService, useValue: questionDeliveryService },
        { provide: AnswerSubmissionService, useValue: answerSubmissionService },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AssessmentPermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AssessmentAttemptOwnershipGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AssessmentResultOwnershipGuard)
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

  describe('listDeadlines', () => {
    it('delegates to AssessmentService.listDeadlinesForStudent with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.listDeadlines(user);

      expect(assessmentService.listDeadlinesForStudent).toHaveBeenCalledWith('student-1');
      expect(result).toEqual(mockDeadlinesResponse);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.listDeadlines(user);

      expect(assessmentService.listDeadlinesForStudent).toHaveBeenCalledTimes(1);
      expect(assessmentService.listDeadlinesForStudent).toHaveBeenCalledWith('student-from-jwt');
    });

    it('response groups deadlines into upcoming/active/late/missed/closed and never leaks backend-only fields', async () => {
      const user = makeUser('student-1');
      const result = await controller.listDeadlines(user) as unknown as Record<string, unknown>;

      expect(result).toHaveProperty('upcoming');
      expect(result).toHaveProperty('active');
      expect(result).toHaveProperty('late');
      expect(result).toHaveProperty('missed');
      expect(result).toHaveProperty('closed');
      const json = JSON.stringify(result);
      expect(json).not.toContain('late_window_seconds');
      expect(json).not.toContain('late_penalty_percent');
    });
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

  describe('getAttemptQuestions', () => {
    it('delegates to QuestionDeliveryService.getQuestionsForAttempt with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.getAttemptQuestions('att-1', user);

      expect(questionDeliveryService.getQuestionsForAttempt).toHaveBeenCalledWith('att-1', 'student-1');
      expect(result).toHaveLength(1);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.getAttemptQuestions('att-2', user);

      expect(questionDeliveryService.getQuestionsForAttempt).toHaveBeenCalledWith('att-2', 'student-from-jwt');
    });
  });

  describe('submitAnswer', () => {
    it('delegates to AnswerSubmissionService.submitAnswer with the JWT-derived user id and request body', async () => {
      const user = makeUser('student-1');
      const result = await controller.submitAnswer(
        'att-1',
        { assessmentQuestionLinkId: 'link-1', responseValue: 'opt-a' },
        user,
      );

      expect(answerSubmissionService.submitAnswer).toHaveBeenCalledWith({
        attemptId: 'att-1',
        studentId: 'student-1',
        assessmentQuestionLinkId: 'link-1',
        responseValue: 'opt-a',
      });
      expect(result).toEqual({
        answerId: 'answer-1', assessmentQuestionLinkId: 'link-1', submittedAt: expect.any(Date),
      });
    });

    it('response never includes isCorrect or score', async () => {
      const user = makeUser('student-1');
      const result = await controller.submitAnswer(
        'att-1',
        { assessmentQuestionLinkId: 'link-1', responseValue: 'opt-a' },
        user,
      ) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('isCorrect');
      expect(result).not.toHaveProperty('score');
      expect(result).not.toHaveProperty('pointsAwarded');
    });
  });

  describe('resumeAttempt', () => {
    it('delegates to AttemptLifecycleService.resumeAttempt with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.resumeAttempt('att-1', user);

      expect(attemptLifecycleService.resumeAttempt).toHaveBeenCalledWith('att-1', 'student-1');
      expect(result).toEqual({ attemptId: 'att-1', status: 'in_progress', expiresAt: null });
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.resumeAttempt('att-2', user);

      expect(attemptLifecycleService.resumeAttempt).toHaveBeenCalledTimes(1);
      expect(attemptLifecycleService.resumeAttempt).toHaveBeenCalledWith('att-2', 'student-from-jwt');
    });

    it('response exposes no backend-only fields (pass_threshold, late_penalty_percent, correct_answer, score)', async () => {
      const user = makeUser('student-1');
      const result = await controller.resumeAttempt('att-1', user) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('pass_threshold');
      expect(result).not.toHaveProperty('late_penalty_percent');
      expect(result).not.toHaveProperty('correct_answer');
      expect(result).not.toHaveProperty('score');
      expect(result).not.toHaveProperty('passed');
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

  describe('getResultHistory', () => {
    it('delegates to AssessmentResultService.listByAssessment with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.getResultHistory('assessment-1', user);

      expect(resultService.listByAssessment).toHaveBeenCalledWith('assessment-1', 'student-1');
      expect(result).toEqual(mockResultHistory);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.getResultHistory('assessment-2', user);

      expect(resultService.listByAssessment).toHaveBeenCalledTimes(1);
      expect(resultService.listByAssessment).toHaveBeenCalledWith('assessment-2', 'student-from-jwt');
    });

    it('response exposes no backend-only fields (pass_threshold, late_penalty_percent, correct_answer)', async () => {
      const user = makeUser('student-1');
      const result = await controller.getResultHistory('assessment-1', user) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('pass_threshold');
      expect(result).not.toHaveProperty('late_penalty_percent');
      expect(result).not.toHaveProperty('correct_answer');
      const results = result['results'] as Record<string, unknown>[];
      for (const item of results) {
        expect(item).not.toHaveProperty('correct_answer');
        expect(item).not.toHaveProperty('correctAnswer');
        expect(item).not.toHaveProperty('pass_threshold');
      }
    });
  });

  describe('getAttemptResult', () => {
    it('delegates to AssessmentFeedbackService.getFeedback with the JWT-derived user id', async () => {
      const user = makeUser('student-1');
      const result = await controller.getAttemptResult('att-1', user);

      expect(feedbackService.getFeedback).toHaveBeenCalledWith('att-1', 'student-1');
      expect(result).toEqual(mockFeedbackSummary);
    });

    it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
      const user = makeUser('student-from-jwt');
      await controller.getAttemptResult('att-2', user);

      expect(feedbackService.getFeedback).toHaveBeenCalledTimes(1);
      expect(feedbackService.getFeedback).toHaveBeenCalledWith('att-2', 'student-from-jwt');
    });

    it('response never includes correct answer text', async () => {
      const user = makeUser('student-1');
      const result = await controller.getAttemptResult('att-1', user) as unknown as Record<string, unknown>;

      expect(result).not.toHaveProperty('correct_answer');
      expect(result).not.toHaveProperty('correctAnswer');
      const breakdown = result['breakdown'] as Record<string, unknown>[];
      for (const item of breakdown) {
        expect(item).not.toHaveProperty('correct_answer');
        expect(item).not.toHaveProperty('correctAnswer');
      }
    });
  });
});
