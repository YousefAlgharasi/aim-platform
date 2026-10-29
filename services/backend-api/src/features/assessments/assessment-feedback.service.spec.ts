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

  describe('review', () => {
    function makeReviewDb(opts: { passed: boolean; used: number; maxAttempts: number; type?: string; cert?: boolean }) {
      return {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('FROM assessment_results')) return { rows: [{ ...RESULT_ROW, passed: opts.passed }] };
          if (sql.includes('FROM assessment_attempts a')) {
            return { rows: [{ assessment_id: 'asm-1', student_id: 'stu-1', type: opts.type ?? 'exam', course_id: 'course-1', max_attempts: opts.maxAttempts }] };
          }
          if (sql.includes('COUNT(*)')) return { rows: [{ count: String(opts.used) }] };
          if (sql.includes('FROM assessment_settings')) return { rows: [{ feedback_policy: 'none', result_visibility: 'immediate' }] };
          if (sql.includes('assessment_result_breakdowns')) return { rows: BREAKDOWN_ROWS };
          if (sql.includes('FROM assessment_questions')) {
            return { rows: [
              { link_id: 'ql-1', question_id: 'q-1', prompt: 'One?', points: '5', response_value: 'c-1a' },
              { link_id: 'ql-2', question_id: 'q-2', prompt: 'Two?', points: '5', response_value: 'c-2b' },
              { link_id: 'ql-3', question_id: 'q-3', prompt: 'Three?', points: '5', response_value: null },
            ] };
          }
          if (sql.includes('FROM question_choices')) {
            return { rows: [
              { id: 'c-1a', question_id: 'q-1', text: 'a', is_correct: true },
              { id: 'c-2a', question_id: 'q-2', text: 'a', is_correct: true },
              { id: 'c-2b', question_id: 'q-2', text: 'b', is_correct: false },
              { id: 'c-3a', question_id: 'q-3', text: 'a', is_correct: true },
            ] };
          }
          if (sql.includes('FROM certificates')) return { rows: opts.cert ? [{ id: 'cert-1' }] : [] };
          return { rows: [] };
        }),
      };
    }

    it('marks each question correct, wrong or skipped with counts and percent', async () => {
      const svc = new AssessmentFeedbackService(makeReviewDb({ passed: true, used: 1, maxAttempts: 3, cert: true }) as any);
      const fb = await svc.getFeedback('att-1', 'stu-1');
      expect(fb.review.map(r => r.status)).toEqual(['correct', 'wrong', 'skipped']);
      expect(fb.review[2].selectedOptionId).toBeNull();
      expect([fb.correctCount, fb.wrongCount, fb.skippedCount, fb.totalQuestions]).toEqual([1, 1, 1, 3]);
      expect(fb.percentScore).toBe(80);
      expect(fb.certificateId).toBe('cert-1');
    });

    it('reveals correct options once passed', async () => {
      const svc = new AssessmentFeedbackService(makeReviewDb({ passed: true, used: 1, maxAttempts: 3 }) as any);
      const fb = await svc.getFeedback('att-1', 'stu-1');
      expect(fb.answersRevealed).toBe(true);
      expect(fb.review[1].correctOptionIds).toEqual(['c-2a']);
    });

    it('hides correct options while a retake is still possible', async () => {
      const svc = new AssessmentFeedbackService(makeReviewDb({ passed: false, used: 1, maxAttempts: 3 }) as any);
      const fb = await svc.getFeedback('att-1', 'stu-1');
      expect(fb.answersRevealed).toBe(false);
      fb.review.forEach(r => expect(r.correctOptionIds).toEqual([]));
      expect(fb.certificateId).toBeNull();
    });

    it('reveals correct options when no attempts are left', async () => {
      const svc = new AssessmentFeedbackService(makeReviewDb({ passed: false, used: 3, maxAttempts: 3 }) as any);
      const fb = await svc.getFeedback('att-1', 'stu-1');
      expect(fb.answersRevealed).toBe(true);
    });
  });
});
