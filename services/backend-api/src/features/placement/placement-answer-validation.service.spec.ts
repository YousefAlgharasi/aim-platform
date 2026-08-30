// Unit tests for PlacementAnswerValidationService.
//
// Coverage:
//   - Objective question types (multiple_choice/true_false/fill_blank/listening_choice)
//     are evaluated and written to is_correct as before.
//   - writing/speaking answers are AI-graded (P4-052) and must NOT be
//     force-marked is_correct = false by the deterministic evaluator — doing
//     so previously corrupted skill_mastery_map/weakness_map by always
//     flagging the placement writing/speaking skills as weaknesses.

import { QueryResult } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { PlacementAnswerValidationService } from './placement-answer-validation.service';

interface AnswerFixture {
  readonly answer_id: string;
  readonly answer_value: string;
  readonly correct_answer: string;
  readonly question_type: string;
}

function makeDb(answers: AnswerFixture[]) {
  const queries: Array<{ sql: string; params: unknown[] }> = [];
  const db: jest.Mocked<Pick<DatabaseService, 'query'>> = {
    query: jest.fn().mockImplementation(async (sql: string, params: unknown[] = []) => {
      queries.push({ sql, params });
      if (sql.includes('SELECT')) {
        return { rows: answers, rowCount: answers.length } as unknown as QueryResult;
      }
      return { rows: [], rowCount: 0 } as unknown as QueryResult;
    }),
  };
  return { db, queries };
}

describe('PlacementAnswerValidationService', () => {
  it('evaluates objective question types and writes is_correct', async () => {
    const { db, queries } = makeDb([
      { answer_id: 'a1', answer_value: 'B', correct_answer: 'b', question_type: 'multiple_choice' },
      { answer_id: 'a2', answer_value: 'true', correct_answer: 'false', question_type: 'true_false' },
    ]);
    const service = new PlacementAnswerValidationService(db as unknown as DatabaseService);

    const summary = await service.validateAnswersForAttempt('attempt-1');

    expect(summary).toEqual({ totalEvaluated: 2, totalCorrect: 1, totalIncorrect: 1 });
    // One UPDATE for correct ids, one for incorrect ids.
    const updateQueries = queries.filter((q) => q.sql.includes('UPDATE'));
    expect(updateQueries).toHaveLength(2);
  });

  it('does not force is_correct on writing/speaking answers (AI-graded, P4-052)', async () => {
    const { db, queries } = makeDb([
      { answer_id: 'a1', answer_value: 'B', correct_answer: 'b', question_type: 'multiple_choice' },
      { answer_id: 'a2', answer_value: 'A paragraph about my trip...', correct_answer: 'ai_graded', question_type: 'writing' },
      { answer_id: 'a3', answer_value: 'transcribed speech...', correct_answer: 'ai_graded', question_type: 'speaking' },
    ]);
    const service = new PlacementAnswerValidationService(db as unknown as DatabaseService);

    const summary = await service.validateAnswersForAttempt('attempt-1');

    // Only the multiple_choice answer is objectively evaluated.
    expect(summary.totalEvaluated).toBe(1);
    expect(summary.totalCorrect).toBe(1);
    expect(summary.totalIncorrect).toBe(0);

    const updateQueries = queries.filter((q) => q.sql.includes('UPDATE'));
    // Only the "correct" bulk update should run — no "incorrect" update, and
    // neither should reference the writing/speaking answer ids.
    expect(updateQueries).toHaveLength(1);
    expect(updateQueries[0].params[0]).toEqual(['a1']);
  });
});
