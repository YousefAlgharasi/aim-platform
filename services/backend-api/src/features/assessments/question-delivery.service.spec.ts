// P10-041: QuestionDeliveryService unit tests.
//
// Coverage:
//   - Questions are delivered without correct_answer, is_correct, points,
//     weight, grading_mode, or pass_threshold.
//   - Options are delivered without is_correct or correctness indicators.

import { NotFoundException } from '@nestjs/common';
import { QuestionDeliveryService, DeliveredQuestion } from './question-delivery.service';

describe('QuestionDeliveryService', () => {
  let service: QuestionDeliveryService;
  let mockDb: { query: jest.Mock };

  const ASSESSMENT_ID = 'assessment-1';

  const questionRows = [
    { link_id: 'link-1', section_id: 'sec-1', link_order: 1, question_id: 'q-1', question_type: 'mcq', prompt: 'What is 2+2?' },
    { link_id: 'link-2', section_id: null, link_order: 2, question_id: 'q-2', question_type: 'mcq', prompt: 'Capital of France?' },
  ];

  const optionRows = [
    { id: 'opt-1', question_id: 'q-1', text: '3', sort_order: 0 },
    { id: 'opt-2', question_id: 'q-1', text: '4', sort_order: 1 },
    { id: 'opt-3', question_id: 'q-2', text: 'London', sort_order: 0 },
    { id: 'opt-4', question_id: 'q-2', text: 'Paris', sort_order: 1 },
  ];

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: questionRows })
        .mockResolvedValueOnce({ rows: optionRows }),
    };
    service = new QuestionDeliveryService(mockDb as any, {} as any);
  });

  it('returns questions with options in order', async () => {
    const result = await service.getQuestionsForAssessment(ASSESSMENT_ID);

    expect(result).toHaveLength(2);
    expect(result[0].prompt).toBe('What is 2+2?');
    expect(result[0].options).toHaveLength(2);
    expect(result[1].prompt).toBe('Capital of France?');
    expect(result[1].options).toHaveLength(2);
  });

  it('throws NotFoundException when no questions found', async () => {
    mockDb.query = jest.fn().mockResolvedValueOnce({ rows: [] });
    await expect(service.getQuestionsForAssessment(ASSESSMENT_ID))
      .rejects.toThrow(NotFoundException);
  });

  it('question SQL never selects correct_answer, is_correct, points, or weight', async () => {
    await service.getQuestionsForAssessment(ASSESSMENT_ID);

    const questionSql: string = mockDb.query.mock.calls[0][0];
    expect(questionSql).not.toContain('correct_answer');
    expect(questionSql).not.toContain('is_correct');
    expect(questionSql).not.toContain('points');
    expect(questionSql).not.toContain('weight');
    expect(questionSql).not.toContain('pass_threshold');
    expect(questionSql).not.toContain('grading_mode');
  });

  it('option SQL never selects is_correct or correct_answer', async () => {
    await service.getQuestionsForAssessment(ASSESSMENT_ID);

    const optionSql: string = mockDb.query.mock.calls[1][0];
    expect(optionSql).not.toContain('is_correct');
    expect(optionSql).not.toContain('correct_answer');
  });

  it('delivered questions never include backend-only fields', async () => {
    const result = await service.getQuestionsForAssessment(ASSESSMENT_ID);
    const json = JSON.stringify(result);

    expect(json).not.toContain('correct_answer');
    expect(json).not.toContain('correctAnswer');
    expect(json).not.toContain('is_correct');
    expect(json).not.toContain('isCorrect');
    expect(json).not.toContain('pass_threshold');
    expect(json).not.toContain('passThreshold');
    expect(json).not.toContain('late_penalty_percent');
    expect(json).not.toContain('latePenaltyPercent');
    expect(json).not.toContain('grading_mode');
    expect(json).not.toContain('gradingMode');

    for (const q of result) {
      expect(q).not.toHaveProperty('points');
      expect(q).not.toHaveProperty('weight');
      expect(q).not.toHaveProperty('correctOptionId');
      expect(q).not.toHaveProperty('correct_answer');
      for (const o of q.options) {
        expect(o).not.toHaveProperty('is_correct');
        expect(o).not.toHaveProperty('isCorrect');
      }
    }
  });

  it('maps fields correctly to DeliveredQuestion shape', async () => {
    const result = await service.getQuestionsForAssessment(ASSESSMENT_ID);
    const q = result[0];

    expect(q.id).toBe('q-1');
    expect(q.assessmentQuestionLinkId).toBe('link-1');
    expect(q.sectionId).toBe('sec-1');
    expect(q.order).toBe(1);
    expect(q.type).toBe('mcq');
    expect(q.options[0]).toEqual({ id: 'opt-1', label: 'A', text: '3' });
  });

  describe('getQuestionsForAttempt', () => {
    it('returns the assessment questions when the attempt belongs to the student', async () => {
      const repo = {
        findAttemptById: jest.fn().mockResolvedValue({
          id: 'att-1', assessment_id: ASSESSMENT_ID, student_id: 'stu-1', status: 'started',
        }),
      };
      const svc = new QuestionDeliveryService(mockDb as any, repo as any);

      const result = await svc.getQuestionsForAttempt('att-1', 'stu-1');

      expect(result).toHaveLength(2);
      expect(repo.findAttemptById).toHaveBeenCalledWith('att-1');
    });

    it('throws NotFoundException when the attempt does not belong to the student', async () => {
      const repo = {
        findAttemptById: jest.fn().mockResolvedValue({
          id: 'att-1', assessment_id: ASSESSMENT_ID, student_id: 'someone-else', status: 'started',
        }),
      };
      const svc = new QuestionDeliveryService(mockDb as any, repo as any);

      await expect(svc.getQuestionsForAttempt('att-1', 'stu-1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the attempt does not exist', async () => {
      const repo = { findAttemptById: jest.fn().mockResolvedValue(null) };
      const svc = new QuestionDeliveryService(mockDb as any, repo as any);

      await expect(svc.getQuestionsForAttempt('att-missing', 'stu-1')).rejects.toThrow(NotFoundException);
    });
  });
});
