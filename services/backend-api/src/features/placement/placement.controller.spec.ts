import { Test, TestingModule } from '@nestjs/testing';
import { PlacementController } from './placement.controller';
import { PlacementTestReadService } from './placement-test-read.service';
import { PlacementAttemptService } from './placement-attempt.service';
import { PlacementSectionsService } from './placement-sections.service';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import { PlacementResultReadService } from './placement-result-read.service';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { PlacementPermissionGuard } from './placement-permission.guard';

const GUARDS_KEY = '__guards__';

function getMethodGuards(proto: object, method: string): Function[] {
  return Reflect.getMetadata(GUARDS_KEY, (proto as any)[method]) ?? [];
}

describe('PlacementController', () => {
  let controller: PlacementController;
  let testRead: jest.Mocked<PlacementTestReadService>;
  let attemptStart: jest.Mocked<PlacementAttemptService>;
  let sections: jest.Mocked<PlacementSectionsService>;
  let questionDelivery: jest.Mocked<PlacementQuestionDeliveryService>;
  let answerSubmit: jest.Mocked<PlacementAnswerSubmitService>;
  let attemptComplete: jest.Mocked<PlacementAttemptCompleteService>;
  let resultRead: jest.Mocked<PlacementResultReadService>;

  beforeEach(async () => {
    const mocks = {
      testRead: { getActiveTest: jest.fn().mockResolvedValue({ id: 'test-1', title: 'Placement', totalSections: 4 }) },
      attemptStart: { startAttempt: jest.fn().mockResolvedValue({ attemptId: 'att-1', status: 'active' }) },
      sections: { getSections: jest.fn().mockResolvedValue({ sections: [], total: 0 }) },
      questionDelivery: { getQuestionsForSection: jest.fn().mockResolvedValue({ questions: [] }) },
      answerSubmit: { submitAnswer: jest.fn().mockResolvedValue({ answerId: 'ans-1' }) },
      attemptComplete: { completeAttempt: jest.fn().mockResolvedValue({ status: 'submitted' }) },
      resultRead: { getResult: jest.fn().mockResolvedValue({ estimatedLevel: 'A1' }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacementController],
      providers: [
        { provide: PlacementTestReadService, useValue: mocks.testRead },
        { provide: PlacementAttemptService, useValue: mocks.attemptStart },
        { provide: PlacementSectionsService, useValue: mocks.sections },
        { provide: PlacementQuestionDeliveryService, useValue: mocks.questionDelivery },
        { provide: PlacementAnswerSubmitService, useValue: mocks.answerSubmit },
        { provide: PlacementAttemptCompleteService, useValue: mocks.attemptComplete },
        { provide: PlacementResultReadService, useValue: mocks.resultRead },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PlacementPermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(PlacementController);
    testRead = module.get(PlacementTestReadService) as any;
    attemptStart = module.get(PlacementAttemptService) as any;
    sections = module.get(PlacementSectionsService) as any;
    questionDelivery = module.get(PlacementQuestionDeliveryService) as any;
    answerSubmit = module.get(PlacementAnswerSubmitService) as any;
    attemptComplete = module.get(PlacementAttemptCompleteService) as any;
    resultRead = module.get(PlacementResultReadService) as any;
  });

  describe('getActiveTest (P4-038)', () => {
    it('delegates to PlacementTestReadService.getActiveTest', async () => {
      await controller.getActiveTest();
      expect(testRead.getActiveTest).toHaveBeenCalled();
    });

    it('applies SupabaseJwtAuthGuard and PlacementPermissionGuard', () => {
      const guards = getMethodGuards(controller, 'getActiveTest');
      const names = guards.map((g) => g.name);
      expect(names).toContain('SupabaseJwtAuthGuard');
      expect(names).toContain('PlacementPermissionGuard');
    });
  });

  describe('startAttempt (P4-041)', () => {
    it('delegates to PlacementAttemptService.startAttempt with user.id', async () => {
      const user = { id: 'student-1', email: 's@test.com', role: 'student' } as any;
      await controller.startAttempt(user);
      expect(attemptStart.startAttempt).toHaveBeenCalledWith('student-1');
    });
  });

  describe('getSections (P4-039)', () => {
    it('delegates to PlacementSectionsService.getSections', async () => {
      await controller.getSections();
      expect(sections.getSections).toHaveBeenCalled();
    });
  });

  describe('getQuestions (P4-040)', () => {
    it('delegates to PlacementQuestionDeliveryService.getQuestionsForSection', async () => {
      await controller.getQuestions('section-1');
      expect(questionDelivery.getQuestionsForSection).toHaveBeenCalledWith('section-1');
    });
  });

  describe('submitAnswer (P4-042)', () => {
    it('delegates to PlacementAnswerSubmitService.submitAnswer', async () => {
      const user = { id: 'student-1' } as any;
      const body = { questionId: 'q-1', answerValue: 'A' } as any;
      await controller.submitAnswer('att-1', user, body);
      expect(answerSubmit.submitAnswer).toHaveBeenCalledWith('att-1', 'student-1', body);
    });
  });

  describe('completeAttempt (P4-043)', () => {
    it('delegates to PlacementAttemptCompleteService.completeAttempt', async () => {
      const user = { id: 'student-1' } as any;
      await controller.completeAttempt('att-1', user);
      expect(attemptComplete.completeAttempt).toHaveBeenCalledWith('att-1', 'student-1');
    });
  });

  describe('getResult (P4-048)', () => {
    it('delegates to PlacementResultReadService.getResult', async () => {
      const user = { id: 'student-1' } as any;
      await controller.getResult('att-1', user);
      expect(resultRead.getResult).toHaveBeenCalledWith('att-1', 'student-1');
    });
  });
});
