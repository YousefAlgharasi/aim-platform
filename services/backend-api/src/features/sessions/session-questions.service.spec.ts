// SessionQuestionsService tests.
//
// Covers:
//   listQuestionsForLesson:
//     - verifies active session ownership (NOT_FOUND otherwise)
//     - enforces P20-010 course gating via LessonProgressService
//     - NOT_FOUND for an unpublished/missing lesson
//     - delivers published questions with options and NO correctness data
//   resolveItemForAttempt:
//     - NOT_FOUND for an unknown/unpublished item
//     - option-based: correct by choice id, correct by choice text, incorrect
//     - text-based: correct via question_answers.value shapes, incorrect
//     - missing grading data => isCorrect=false (never guessed)
//     - skillIds resolved from question_skill_links
//     - answerFormat/presentedDifficulty mapping

import {
  SessionQuestionsService,
} from './session-questions.service';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '880e8400-e29b-41d4-a716-446655440070';
const LESSON_ID = '5e000000-0000-0000-0001-000000000013';
const QUESTION_ID = 'a0000000-0000-0000-0001-000000000001';

type QueryResult = { rows: unknown[]; rowCount: number };

/**
 * Route-by-SQL mock DatabaseService: each handler matches a substring of the
 * SQL text and returns rows.
 */
function makeDb(handlers: Array<[string, unknown[]]>) {
  const query = jest.fn(async (sql: string): Promise<QueryResult> => {
    for (const [needle, rows] of handlers) {
      if (sql.includes(needle)) {
        return { rows, rowCount: rows.length };
      }
    }
    return { rows: [], rowCount: 0 };
  });
  return { query };
}

function makeLessonProgress(unlocked = true) {
  return {
    assertCourseUnlockedForLesson: unlocked
      ? jest.fn().mockResolvedValue(undefined)
      : jest.fn().mockRejectedValue(Object.assign(new Error('locked'), { status: 403 })),
  };
}

function makeService(
  db: ReturnType<typeof makeDb>,
  lessonProgress = makeLessonProgress(),
) {
  return {
    service: new SessionQuestionsService(db as never, lessonProgress as never),
    lessonProgress,
  };
}

const ACTIVE_SESSION_ROW = [{ id: SESSION_ID }];
const PUBLISHED_LESSON_ROW = [{ id: LESSON_ID }];
const QUESTION_ROW = {
  id: QUESTION_ID,
  key: 'q.a1.grammar.to_be.01',
  type: 'multiple_choice',
  difficulty: 'easy',
  prompt: 'He _____ a teacher.',
  metadata: { tags: ['a1', 'grammar'] },
};
const CHOICE_ROWS = [
  { id: 'choice-1', question_id: QUESTION_ID, text: 'is', sort_order: 0, is_correct: true },
  { id: 'choice-2', question_id: QUESTION_ID, text: 'are', sort_order: 1, is_correct: false },
];

// ---------------------------------------------------------------------------
// listQuestionsForLesson
// ---------------------------------------------------------------------------

describe('SessionQuestionsService.listQuestionsForLesson', () => {
  it('throws NOT_FOUND when no active owned session exists', async () => {
    const db = makeDb([['FROM learning_sessions', []]]);
    const { service } = makeService(db);
    await expect(
      service.listQuestionsForLesson(STUDENT_ID, SESSION_ID, LESSON_ID),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('enforces P20-010 course gating before delivering questions', async () => {
    const db = makeDb([['FROM learning_sessions', ACTIVE_SESSION_ROW]]);
    const lessonProgress = makeLessonProgress(false);
    const { service } = makeService(db, lessonProgress);
    await expect(
      service.listQuestionsForLesson(STUDENT_ID, SESSION_ID, LESSON_ID),
    ).rejects.toMatchObject({ status: 403 });
    expect(lessonProgress.assertCourseUnlockedForLesson).toHaveBeenCalledWith(
      STUDENT_ID,
      LESSON_ID,
    );
  });

  it('throws NOT_FOUND for a missing/unpublished lesson', async () => {
    const db = makeDb([
      ['FROM learning_sessions', ACTIVE_SESSION_ROW],
      ['FROM lessons', []],
    ]);
    const { service } = makeService(db);
    await expect(
      service.listQuestionsForLesson(STUDENT_ID, SESSION_ID, LESSON_ID),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('delivers published questions with options and no correctness data', async () => {
    const db = makeDb([
      ['FROM learning_sessions', ACTIVE_SESSION_ROW],
      ['FROM lessons', PUBLISHED_LESSON_ROW],
      ['FROM lesson_skills', [QUESTION_ROW]],
      ['FROM question_choices', CHOICE_ROWS],
    ]);
    const { service } = makeService(db);
    const result = await service.listQuestionsForLesson(STUDENT_ID, SESSION_ID, LESSON_ID);

    expect(result.lessonId).toBe(LESSON_ID);
    expect(result.questions).toHaveLength(1);
    const q = result.questions[0];
    expect(q).toEqual({
      id: QUESTION_ID,
      type: 'multiple_choice',
      stem: 'He _____ a teacher.',
      difficulty: 'easy',
      tags: ['a1', 'grammar'],
      options: [
        { id: 'choice-1', text: 'is', order: 0 },
        { id: 'choice-2', text: 'are', order: 1 },
      ],
    });
    // Correctness never leaks in any spelling.
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('is_correct');
    expect(serialized).not.toContain('isCorrect');
  });

  it('returns an empty list when the lesson has no published linked questions', async () => {
    const db = makeDb([
      ['FROM learning_sessions', ACTIVE_SESSION_ROW],
      ['FROM lessons', PUBLISHED_LESSON_ROW],
      ['FROM lesson_skills', []],
    ]);
    const { service } = makeService(db);
    const result = await service.listQuestionsForLesson(STUDENT_ID, SESSION_ID, LESSON_ID);
    expect(result.questions).toEqual([]);
  });

  it('tolerates non-array/missing metadata tags', async () => {
    const db = makeDb([
      ['FROM learning_sessions', ACTIVE_SESSION_ROW],
      ['FROM lessons', PUBLISHED_LESSON_ROW],
      ['FROM lesson_skills', [{ ...QUESTION_ROW, metadata: null }]],
      ['FROM question_choices', []],
    ]);
    const { service } = makeService(db);
    const result = await service.listQuestionsForLesson(STUDENT_ID, SESSION_ID, LESSON_ID);
    expect(result.questions[0].tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// resolveItemForAttempt
// ---------------------------------------------------------------------------

describe('SessionQuestionsService.resolveItemForAttempt', () => {
  const SKILL_LINKS = [{ skill_key: 'skill.grammar.to_be' }];

  function choiceDb(extra: Array<[string, unknown[]]> = []) {
    return makeDb([
      ['FROM questions', [QUESTION_ROW]],
      ['FROM question_skill_links', SKILL_LINKS],
      ['FROM question_choices', CHOICE_ROWS],
      ...extra,
    ]);
  }

  it('throws NOT_FOUND for an unknown or unpublished item', async () => {
    const db = makeDb([['FROM questions', []]]);
    const { service } = makeService(db);
    await expect(
      service.resolveItemForAttempt(QUESTION_ID, 'choice-1'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('marks correct when answerValue is the correct choice id', async () => {
    const { service } = makeService(choiceDb());
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, 'choice-1');
    expect(resolved.isCorrect).toBe(true);
    expect(resolved.itemType).toBe('lesson_question');
    expect(resolved.answerFormat).toBe('multiple_choice');
    expect(resolved.presentedDifficulty).toBe(1);
    expect(resolved.optionsPresentedCount).toBe(2);
    expect(resolved.skillIds).toEqual(['skill.grammar.to_be']);
  });

  it('marks correct when answerValue matches the correct choice text', async () => {
    const { service } = makeService(choiceDb());
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, '  IS ');
    expect(resolved.isCorrect).toBe(true);
  });

  it('marks incorrect for a wrong choice', async () => {
    const { service } = makeService(choiceDb());
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, 'choice-2');
    expect(resolved.isCorrect).toBe(false);
  });

  it('marks incorrect (never guesses) when a choice question has no grading data', async () => {
    const db = makeDb([
      ['FROM questions', [QUESTION_ROW]],
      ['FROM question_skill_links', SKILL_LINKS],
      ['FROM question_choices', []],
    ]);
    const { service } = makeService(db);
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, 'choice-1');
    expect(resolved.isCorrect).toBe(false);
    expect(resolved.optionsPresentedCount).toBe(0);
  });

  it('grades fill_in_blank against question_answers.value string', async () => {
    const db = makeDb([
      ['FROM questions', [{ ...QUESTION_ROW, type: 'fill_in_blank', difficulty: 'medium' }]],
      ['FROM question_skill_links', SKILL_LINKS],
      ['FROM question_answers', [{ value: 'went' }]],
    ]);
    const { service } = makeService(db);
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, ' Went ');
    expect(resolved.isCorrect).toBe(true);
    expect(resolved.answerFormat).toBe('fill_blank');
    expect(resolved.presentedDifficulty).toBe(2);
    expect(resolved.optionsPresentedCount).toBeNull();
  });

  it('grades fill_in_blank against object/array question_answers.value shapes', async () => {
    const db = makeDb([
      ['FROM questions', [{ ...QUESTION_ROW, type: 'fill_in_blank' }]],
      ['FROM question_skill_links', SKILL_LINKS],
      ['FROM question_answers', [{ value: [{ text: 'went' }, 'walked'] }]],
    ]);
    const { service } = makeService(db);
    expect((await service.resolveItemForAttempt(QUESTION_ID, 'walked')).isCorrect).toBe(true);
    expect((await service.resolveItemForAttempt(QUESTION_ID, 'went')).isCorrect).toBe(true);
    expect((await service.resolveItemForAttempt(QUESTION_ID, 'goed')).isCorrect).toBe(false);
  });

  it('marks incorrect when a text question has no question_answers rows', async () => {
    const db = makeDb([
      ['FROM questions', [{ ...QUESTION_ROW, type: 'fill_in_blank' }]],
      ['FROM question_skill_links', SKILL_LINKS],
      ['FROM question_answers', []],
    ]);
    const { service } = makeService(db);
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, 'anything');
    expect(resolved.isCorrect).toBe(false);
  });

  it('resolves an empty skill list when no links exist', async () => {
    const db = makeDb([
      ['FROM questions', [QUESTION_ROW]],
      ['FROM question_skill_links', []],
      ['FROM question_choices', CHOICE_ROWS],
    ]);
    const { service } = makeService(db);
    const resolved = await service.resolveItemForAttempt(QUESTION_ID, 'choice-1');
    expect(resolved.skillIds).toEqual([]);
  });
});
