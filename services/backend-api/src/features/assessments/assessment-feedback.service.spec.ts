// P10-030: AssessmentFeedbackService unit tests.

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AssessmentFeedbackService } from './assessment-feedback.service';

const RESULT_ROW = {
  id: 'res-1', attempt_id: 'att-1', student_id: 'stu-1',
  score: '80.00', max_score: '100.00', passed: true,
  late_penalty_applied: false, graded_at: new Date(),
};

const BREAKDOWN_ROWS = [
  { assessment_question_link_id: 'ql-1', section_id: null, is_correct: true,  points_awarded: '5.00', points_possible: '5.00' },
  { assessment_question_link_id: 'ql-2', section_id: null, is_correct: false, points_awarded: '0.00', points_possible: '5.00' },
];

function makeDb(policy: string, includeBreakdown = true) {
  return {
    query: jest.fn(async (sql: string) => {
      if (sql.includes('assessment_results')) return { rows: [RESULT_ROW] };
      if (sql.includes('assessment_settings')) return { rows: [{ feedback_policy: policy, result_visibility: 'immediate' }] };
      if (sql.includes('assessment_result_breakdowns')) return { rows: includeBreakdown ? BREAKDOWN_ROWS : [] };
      return { rows: [] };
    }),
  };
}

describe('AssessmentFeedbackService', () => {
  it('returns feedbackAllowed=false and no isCorrect when policy=none', async () => {
    const svc = new AssessmentFeedbackService(makeDb('none') as any);
    const fb = await svc.getFeedback('att-1', 'stu-1');
    expect(fb.feedbackAllowed).toBe(false);
    fb.breakdown.forEach(b => expect(b).not.toHaveProperty('isCorrect'));
  });

  it('includes isCorrect when policy=after_submission', async () => {
    const svc = new AssessmentFeedbackService(makeDb('after_submission') as any);
    const fb = await svc.getFeedback('att-1', 'stu-1');
    expect(fb.feedbackAllowed).toBe(true);
    expect(fb.breakdown[0].isCorrect).toBe(true);
    expect(fb.breakdown[1].isCorrect).toBe(false);
  });

  it('never includes correct answer text in any breakdown item', async () => {
    const svc = new AssessmentFeedbackService(makeDb('after_submission') as any);
    const fb = await svc.getFeedback('att-1', 'stu-1');
    fb.breakdown.forEach(b => {
      expect(b).not.toHaveProperty('correctAnswer');
      expect(b).not.toHaveProperty('correctLabel');
      expect(b).not.toHaveProperty('correctOptionId');
    });
  });

  it('throws NotFoundException when result not found', async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    const svc = new AssessmentFeedbackService(db as any);
    await expect(svc.getFeedback('att-x', 'stu-1')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when student_id does not match', async () => {
    const svc = new AssessmentFeedbackService(makeDb('after_submission') as any);
    await expect(svc.getFeedback('att-1', 'stu-OTHER')).rejects.toThrow(ForbiddenException);
  });

  it('returns score and passed from DB, not from client', async () => {
    const svc = new AssessmentFeedbackService(makeDb('none') as any);
    const fb = await svc.getFeedback('att-1', 'stu-1');
    expect(fb.score).toBe(80);
    expect(fb.maxScore).toBe(100);
    expect(fb.passed).toBe(true);
  });

  it('returns empty breakdown when no breakdown rows exist', async () => {
    const svc = new AssessmentFeedbackService(makeDb('after_submission', false) as any);
    const fb = await svc.getFeedback('att-1', 'stu-1');
    expect(fb.breakdown).toHaveLength(0);
  });
});
