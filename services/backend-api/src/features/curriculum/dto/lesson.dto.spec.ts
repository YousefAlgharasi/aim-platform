import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationError } from '../validation/curriculum-validation.error';
import { validateCreateLessonRequest, validateUpdateLessonRequest } from './lesson.dto';

const VALID_CHAPTER_ID = '11111111-1111-1111-1111-111111111111';

describe('validateCreateLessonRequest', () => {
  it('accepts a valid payload', () => {
    const result = validateCreateLessonRequest({
      chapterId: VALID_CHAPTER_ID,
      title: 'Past Simple Basics',
      description: 'Introduces the past simple tense.',
    });

    expect(result).toEqual({
      chapterId: VALID_CHAPTER_ID,
      title: 'Past Simple Basics',
      description: 'Introduces the past simple tense.',
    });
  });

  it('rejects a missing chapterId', () => {
    try {
      validateCreateLessonRequest({ title: 'Past Simple Basics', description: 'desc' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(CurriculumValidationError);
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.LESSON_CHAPTER_NOT_FOUND);
    }
  });

  it('rejects a missing description (required per P3-010)', () => {
    try {
      validateCreateLessonRequest({ chapterId: VALID_CHAPTER_ID, title: 'Past Simple Basics' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.LESSON_DESCRIPTION_REQUIRED);
    }
  });
});

describe('validateUpdateLessonRequest', () => {
  it('rejects an attempt to change chapterId', () => {
    try {
      validateUpdateLessonRequest({ chapterId: VALID_CHAPTER_ID, title: 'New title' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(CurriculumValidationError);
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.LESSON_CHAPTER_ID_IMMUTABLE);
    }
  });

  it('rejects a client-supplied status', () => {
    try {
      validateUpdateLessonRequest({ status: 'published' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.LESSON_INVALID_STATUS_TRANSITION);
    }
  });

  it('accepts a valid partial update', () => {
    const result = validateUpdateLessonRequest({ order: 3 });
    expect(result).toEqual({ order: 3 });
  });
});
