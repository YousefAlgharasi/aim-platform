// P10-026: AnswerSubmissionService tests.

import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnswerSubmissionService } from './answer-submission.service';

function makeDb(attemptRow: object | null, questionRow: object | null, answerId = 'ans-1') {
  return {
    query: jest.fn(async (sql: string) => {
      if (sql.includes('assessment_attempts')) return { rows: attemptRow ? [attemptRow] : [] };
      if (sql.includes('assessment_questions')) return { rows: questionRow ? [questionRow] : [] };
      if (sql.includes('INSERT INTO assessment_attempt_answers')) return { rows: [{ id: answerId, submitted_at: new Date() }] };
      return { rows: [] }; // UPDATE
    }),
  };
}

const ATTEMPT = { assessment_id: 'a-1', student_id: 's-1', status: 'in_progress' };
const QUESTION = { id: 'ql-1', assessment_id: 'a-1' };
const INPUT = { attemptId: 'att-1', studentId: 's-1', assessmentQuestionLinkId: 'ql-1', responseValue: 'A' };

describe('AnswerSubmissionService', () => {
  it('persists answer and returns dto without isCorrect', async () => {
    const svc = new AnswerSubmissionService(makeDb(ATTEMPT, QUESTION) as any);
    const result = await svc.submitAnswer(INPUT);
    expect(result.answerId).toBe('ans-1');
    expect(result).not.toHaveProperty('isCorrect');
    expect(result).not.toHaveProperty('pointsAwarded');
    expect(result).not.toHaveProperty('score');
  });

  it('throws NotFoundException when attempt missing', async () => {
    const svc = new AnswerSubmissionService(makeDb(null, QUESTION) as any);
    await expect(svc.submitAnswer(INPUT)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when student_id mismatch', async () => {
    const svc = new AnswerSubmissionService(makeDb({ ...ATTEMPT, student_id: 'other' }, QUESTION) as any);
    await expect(svc.submitAnswer(INPUT)).rejects.toThrow(ForbiddenException);
  });

  it('throws ConflictException when attempt not in progress', async () => {
    const svc = new AnswerSubmissionService(makeDb({ ...ATTEMPT, status: 'submitted' }, QUESTION) as any);
    await expect(svc.submitAnswer(INPUT)).rejects.toThrow(ConflictException);
  });

  it('throws BadRequestException when question not in assessment', async () => {
    const svc = new AnswerSubmissionService(makeDb(ATTEMPT, { ...QUESTION, assessment_id: 'other' }) as any);
    await expect(svc.submitAnswer({ ...INPUT })).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException on empty responseValue', async () => {
    const svc = new AnswerSubmissionService(makeDb(ATTEMPT, QUESTION) as any);
    await expect(svc.submitAnswer({ ...INPUT, responseValue: '' })).rejects.toThrow(BadRequestException);
  });

  it('INSERT SQL never includes is_correct or score', async () => {
    const db = makeDb(ATTEMPT, QUESTION);
    const svc = new AnswerSubmissionService(db as any);
    await svc.submitAnswer(INPUT);
    const insertCall = db.query.mock.calls.find((c: string[]) => c[0].includes('INSERT INTO assessment_attempt_answers'));
    expect(insertCall).toBeDefined();
    expect(insertCall![0]).not.toContain('is_correct');
    expect(insertCall![0]).not.toContain('score');
    expect(insertCall![0]).not.toContain('passed');
  });
});
