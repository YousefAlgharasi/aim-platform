// P10-027: AssessmentGradingService unit tests.
//
// Verifies that:
//   - Correct answers earn full points; wrong answers earn 0.
//   - score, maxScore, and passed are computed by the backend exclusively.
//   - pass_threshold and late_penalty_percent come from DB, never from a
//     client-supplied payload.
//   - Late penalty is applied when submitted_at is within the late window.
//   - No grading fields are exposed to Flutter from this service layer.

import { NotFoundException } from '@nestjs/common';
import { AssessmentGradingService } from './assessment-grading.service';

// ---------------------------------------------------------------------------
// Minimal DatabaseService mock
// ---------------------------------------------------------------------------

function makeDb(responses: Record<string, { rows: unknown[] }>) {
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      for (const [key, result] of Object.entries(responses)) {
        if (sql.includes(key)) return result;
      }
      return { rows: [] };
    }),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ATTEMPT_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
const ASSESSMENT_ID = 'bbbbbbbb-0000-0000-0000-000000000001';
const STUDENT_ID = 'cccccccc-0000-0000-0000-000000000001';
const Q_LINK_1 = 'dddddddd-0000-0000-0000-000000000001';
const Q_LINK_2 = 'dddddddd-0000-0000-0000-000000000002';
const Q1_ID = 'eeeeeeee-0000-0000-0000-000000000001';
const Q2_ID = 'eeeeeeee-0000-0000-0000-000000000002';

const NOW = new Date('2026-06-20T10:25:00Z');
const CLOSE = new Date('2026-06-27T23:59:00Z'); // future — on time

function makeAttemptRow(submittedAt = NOW) {
  return {
    assessment_id: ASSESSMENT_ID,
    student_id: STUDENT_ID,
    submitted_at: submittedAt,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AssessmentGradingService', () => {
  describe('gradeAttempt — basic grading', () => {
    it('awards full points for correct answers and 0 for wrong', async () => {
      const db = makeDb({
        assessment_attempts: { rows: [makeAttemptRow()] },
        assessment_settings: {
          rows: [{ pass_threshold: 60, late_penalty_percent: 0 }],
        },
        assessment_attempt_answers: {
          rows: [
            {
              assessment_question_link_id: Q_LINK_1,
              question_id: Q1_ID,
              response_value: 'A', // correct
              points: 5,
            },
            {
              assessment_question_link_id: Q_LINK_2,
              question_id: Q2_ID,
              response_value: 'B', // wrong (correct is 'A')
              points: 5,
            },
          ],
        },
        question_choices: {
          rows: [
            { question_id: Q1_ID, is_correct: true, id: 'A' },
            { question_id: Q2_ID, is_correct: true, id: 'A' },
          ],
        },
        assessment_deadlines: { rows: [] }, // no deadline
      });

      const service = new AssessmentGradingService(db as any);
      const result = await service.gradeAttempt(ATTEMPT_ID);

      expect(result.score).toBe(5);    // only Q1 correct
      expect(result.maxScore).toBe(10);
      expect(result.passed).toBe(false); // 50% < 60% threshold
      expect(result.latePenaltyApplied).toBe(false);
      expect(result.outcomes).toHaveLength(2);
      expect(result.outcomes[0].isCorrect).toBe(true);
      expect(result.outcomes[0].pointsAwarded).toBe(5);
      expect(result.outcomes[1].isCorrect).toBe(false);
      expect(result.outcomes[1].pointsAwarded).toBe(0);
    });

    // Regression: node-postgres returns NUMERIC columns as strings (e.g.
    // "1.00"), not JS numbers — even though AnswerRow.points is typed
    // `number`. Summing string points with `+` silently produced string
    // concatenation instead of arithmetic (rawScore/maxScore came out as
    // NaN), which then failed the assessment_results.max_score CHECK
    // constraint at persist time with a generic 500 on every submit for
    // any assessment with more than one question.
    it('computes correct numeric score/maxScore when points come back as strings, as the real pg driver returns them', async () => {
      const db = makeDb({
        assessment_attempts: { rows: [makeAttemptRow()] },
        assessment_settings: {
          rows: [{ pass_threshold: 60, late_penalty_percent: 0 }],
        },
        assessment_attempt_answers: {
          rows: [
            {
              assessment_question_link_id: Q_LINK_1,
              question_id: Q1_ID,
              response_value: 'A', // correct
              points: '1.00',
            },
            {
              assessment_question_link_id: Q_LINK_2,
              question_id: Q2_ID,
              response_value: 'B', // wrong (correct is 'A')
              points: '1.00',
            },
          ],
        },
        question_choices: {
          rows: [
            { question_id: Q1_ID, is_correct: true, id: 'A' },
            { question_id: Q2_ID, is_correct: true, id: 'A' },
          ],
        },
        assessment_deadlines: { rows: [] },
      });

      const service = new AssessmentGradingService(db as any);
      const result = await service.gradeAttempt(ATTEMPT_ID);

      expect(result.score).toBe(1);
      expect(result.maxScore).toBe(2);
      expect(Number.isNaN(result.score)).toBe(false);
      expect(Number.isNaN(result.maxScore)).toBe(false);
      expect(result.outcomes[0].pointsAwarded).toBe(1);
      expect(result.outcomes[0].pointsPossible).toBe(1);
      expect(result.outcomes[1].pointsPossible).toBe(1);
    });

    it('marks passed=true when score meets pass_threshold', async () => {
      const db = makeDb({
        assessment_attempts: { rows: [makeAttemptRow()] },
        assessment_settings: {
          rows: [{ pass_threshold: 50, late_penalty_percent: 0 }],
        },
        assessment_attempt_answers: {
          rows: [
            {
              assessment_question_link_id: Q_LINK_1,
              question_id: Q1_ID,
              response_value: 'A',
              points: 5,
            },
          ],
        },
        question_choices: {
          rows: [{ question_id: Q1_ID, is_correct: true, id: 'A' }],
        },
        assessment_deadlines: { rows: [] },
      });

      const service = new AssessmentGradingService(db as any);
      const result = await service.gradeAttempt(ATTEMPT_ID);

      expect(result.score).toBe(5);
      expect(result.maxScore).toBe(5);
      expect(result.passed).toBe(true); // 100% >= 50%
    });

    it('throws NotFoundException when attempt does not exist', async () => {
      const db = makeDb({ assessment_attempts: { rows: [] } });
      const service = new AssessmentGradingService(db as any);

      await expect(service.gradeAttempt('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('gradeAttempt — late penalty', () => {
    it('applies late penalty when submitted within late window', async () => {
      const submittedAt = new Date('2026-06-28T01:00:00Z'); // 2h after close
      const closesAt = new Date('2026-06-27T23:59:00Z');

      const db = makeDb({
        assessment_attempts: { rows: [makeAttemptRow(submittedAt)] },
        assessment_settings: {
          rows: [{ pass_threshold: 60, late_penalty_percent: 10 }],
        },
        assessment_attempt_answers: {
          rows: [
            {
              assessment_question_link_id: Q_LINK_1,
              question_id: Q1_ID,
              response_value: 'A',
              points: 10,
            },
          ],
        },
        question_choices: {
          rows: [{ question_id: Q1_ID, is_correct: true, id: 'A' }],
        },
        assessment_deadlines: {
          rows: [
            {
              closes_at: closesAt,
              extended_closes_at: null,
              late_window_seconds: 4 * 3600, // 4h late window
            },
          ],
        },
      });

      const service = new AssessmentGradingService(db as any);
      const result = await service.gradeAttempt(ATTEMPT_ID);

      expect(result.latePenaltyApplied).toBe(true);
      expect(result.score).toBeCloseTo(9); // 10 * (1 - 0.10) = 9
    });

    it('does not apply penalty when submitted on time', async () => {
      const submittedAt = new Date('2026-06-27T20:00:00Z'); // before close
      const closesAt = new Date('2026-06-27T23:59:00Z');

      const db = makeDb({
        assessment_attempts: { rows: [makeAttemptRow(submittedAt)] },
        assessment_settings: {
          rows: [{ pass_threshold: 60, late_penalty_percent: 10 }],
        },
        assessment_attempt_answers: {
          rows: [
            {
              assessment_question_link_id: Q_LINK_1,
              question_id: Q1_ID,
              response_value: 'A',
              points: 10,
            },
          ],
        },
        question_choices: {
          rows: [{ question_id: Q1_ID, is_correct: true, id: 'A' }],
        },
        assessment_deadlines: {
          rows: [
            {
              closes_at: closesAt,
              extended_closes_at: null,
              late_window_seconds: 3600,
            },
          ],
        },
      });

      const service = new AssessmentGradingService(db as any);
      const result = await service.gradeAttempt(ATTEMPT_ID);

      expect(result.latePenaltyApplied).toBe(false);
      expect(result.score).toBe(10);
    });
  });

  describe('backend authority enforcement', () => {
    it('uses pass_threshold from DB — not from any parameter', async () => {
      // This test documents that gradeAttempt() only takes attemptId as input.
      // There is no client-supplied threshold parameter — by design.
      const db = makeDb({
        assessment_attempts: { rows: [makeAttemptRow()] },
        assessment_settings: {
          rows: [{ pass_threshold: 80, late_penalty_percent: 0 }], // high threshold
        },
        assessment_attempt_answers: {
          rows: [
            {
              assessment_question_link_id: Q_LINK_1,
              question_id: Q1_ID,
              response_value: 'A',
              points: 7, // 70% — passes 60 but not 80
            },
            {
              assessment_question_link_id: Q_LINK_2,
              question_id: Q2_ID,
              response_value: 'B', // wrong
              points: 3,
            },
          ],
        },
        question_choices: {
          rows: [
            { question_id: Q1_ID, is_correct: true, id: 'A' },
            { question_id: Q2_ID, is_correct: true, id: 'A' },
          ],
        },
        assessment_deadlines: { rows: [] },
      });

      const service = new AssessmentGradingService(db as any);
      const result = await service.gradeAttempt(ATTEMPT_ID);

      // 70% < 80% DB threshold → not passed
      expect(result.passed).toBe(false);
    });

    it('gradeAttempt signature accepts only attemptId — no client score fields', () => {
      // Type-level assertion: the method takes a single string parameter.
      // This documents that no client-supplied score, correctness, or
      // pass/fail can be injected.
      const service = new AssessmentGradingService({ query: jest.fn() } as any);
      expect(service.gradeAttempt.length).toBe(1);
    });
  });
});
