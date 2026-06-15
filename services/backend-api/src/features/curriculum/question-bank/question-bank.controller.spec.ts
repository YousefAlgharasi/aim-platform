// P3-048 — Add Curriculum Backend Tests
// QuestionBankController unit tests.

import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';

const makeMockService = (): jest.Mocked<
  Pick<QuestionBankService, 'listQuestions' | 'getQuestion' | 'createQuestion' | 'updateQuestion'>
> => ({
  listQuestions: jest.fn(),
  getQuestion: jest.fn(),
  createQuestion: jest.fn(),
  updateQuestion: jest.fn(),
});

const makeReq = (sub = 'user-sub-001') => ({ user: { sub } });

describe('QuestionBankController', () => {
  describe('listQuestions', () => {
    it('delegates with parsed pagination and optional filters', async () => {
      const svc = makeMockService();
      svc.listQuestions.mockResolvedValue({ questions: [], total: 0 } as any);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      await ctrl.listQuestions('mcq', 'easy', 'draft', 'algebra', '3', '10');

      expect(svc.listQuestions).toHaveBeenCalledWith(3, 10, 'mcq', 'easy', 'draft', 'algebra');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listQuestions.mockResolvedValue({ questions: [], total: 0 } as any);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      await ctrl.listQuestions(undefined, undefined, undefined, undefined, 'abc', 'xyz');

      expect(svc.listQuestions).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { questions: [{ id: 'q1' }], total: 1 } as any;
      svc.listQuestions.mockResolvedValue(expected);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      expect(
        await ctrl.listQuestions(undefined, undefined, undefined, undefined, '1', '20'),
      ).toBe(expected);
    });
  });

  describe('getQuestion', () => {
    it('delegates to QuestionBankService with id', async () => {
      const svc = makeMockService();
      svc.getQuestion.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      await ctrl.getQuestion('uuid-1');

      expect(svc.getQuestion).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', type: 'mcq' } as any;
      svc.getQuestion.mockResolvedValue(expected);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      expect(await ctrl.getQuestion('uuid-1')).toBe(expected);
    });
  });

  describe('createQuestion', () => {
    it('injects createdBy from request user sub', async () => {
      const svc = makeMockService();
      svc.createQuestion.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      await ctrl.createQuestion({ stem: 'Q?', type: 'mcq' } as any, makeReq('sub-123'));

      expect(svc.createQuestion).toHaveBeenCalledWith({
        stem: 'Q?',
        type: 'mcq',
        createdBy: 'sub-123',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createQuestion.mockResolvedValue(expected);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      expect(await ctrl.createQuestion({} as any, makeReq())).toBe(expected);
    });
  });

  describe('updateQuestion', () => {
    it('delegates to QuestionBankService with id and body', async () => {
      const svc = makeMockService();
      svc.updateQuestion.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      await ctrl.updateQuestion('uuid-1', { stem: 'Updated Q?' } as any);

      expect(svc.updateQuestion).toHaveBeenCalledWith('uuid-1', { stem: 'Updated Q?' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', stem: 'Updated Q?' } as any;
      svc.updateQuestion.mockResolvedValue(expected);
      const ctrl = new QuestionBankController(svc as unknown as QuestionBankService);

      expect(await ctrl.updateQuestion('uuid-1', {} as any)).toBe(expected);
    });
  });
});
