import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationError } from '../validation/curriculum-validation.error';
import {
  validateCreateQuestionRequest,
  validateQuestionChoiceSet,
  validateUpdateQuestionRequest,
} from './question.dto';

describe('validateCreateQuestionRequest', () => {
  it('accepts a valid multiple_choice question', () => {
    const result = validateCreateQuestionRequest({
      type: 'multiple_choice',
      stem: 'Which sentence uses the past simple correctly?',
      difficulty: 'elementary',
    });

    expect(result).toEqual({
      type: 'multiple_choice',
      stem: 'Which sentence uses the past simple correctly?',
      difficulty: 'elementary',
    });
  });

  it('rejects an invalid type', () => {
    try {
      validateCreateQuestionRequest({ type: 'essay', stem: 'stem', difficulty: 'beginner' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_INVALID_TYPE);
    }
  });

  it('rejects a missing stem', () => {
    try {
      validateCreateQuestionRequest({ type: 'multiple_choice', difficulty: 'beginner' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_MISSING_STEM);
    }
  });

  it('rejects an invalid difficulty', () => {
    try {
      validateCreateQuestionRequest({ type: 'multiple_choice', stem: 'stem', difficulty: 'expert' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_INVALID_DIFFICULTY);
    }
  });
});

describe('validateUpdateQuestionRequest', () => {
  it('rejects an attempt to change type', () => {
    try {
      validateUpdateQuestionRequest({ type: 'true_false' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_TYPE_IMMUTABLE);
    }
  });
});

describe('validateQuestionChoiceSet', () => {
  it('passes for a multiple_choice question with exactly one correct choice', () => {
    expect(() =>
      validateQuestionChoiceSet('multiple_choice', [{ isCorrect: false }, { isCorrect: true }, { isCorrect: false }]),
    ).not.toThrow();
  });

  it('rejects a multiple_choice question with zero correct choices', () => {
    try {
      validateQuestionChoiceSet('multiple_choice', [{ isCorrect: false }, { isCorrect: false }]);
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_CHOICE_CONFLICT);
    }
  });

  it('rejects a multiple_choice question with more than one correct choice', () => {
    try {
      validateQuestionChoiceSet('multiple_choice', [{ isCorrect: true }, { isCorrect: true }]);
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_CHOICE_CONFLICT);
    }
  });

  it('rejects a multiple_select question with zero correct choices', () => {
    try {
      validateQuestionChoiceSet('multiple_select', [{ isCorrect: false }, { isCorrect: false }]);
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_NO_CORRECT_ANSWER);
    }
  });

  it('requires exactly two choices for true_false', () => {
    try {
      validateQuestionChoiceSet('true_false', [{ isCorrect: true }]);
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.QUESTION_TRUE_FALSE_INVALID);
    }
  });

  it('passes true_false with exactly two choices and one correct', () => {
    expect(() => validateQuestionChoiceSet('true_false', [{ isCorrect: true }, { isCorrect: false }])).not.toThrow();
  });

  it('does not validate choices for short_answer questions', () => {
    expect(() => validateQuestionChoiceSet('short_answer', [])).not.toThrow();
  });
});
