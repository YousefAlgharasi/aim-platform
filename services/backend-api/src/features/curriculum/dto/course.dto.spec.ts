import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationError } from '../validation/curriculum-validation.error';
import { validateCreateCourseRequest, validateUpdateCourseRequest } from './course.dto';

describe('validateCreateCourseRequest', () => {
  it('accepts a minimal valid payload', () => {
    const result = validateCreateCourseRequest({ title: 'English A1' });

    expect(result).toEqual({
      title: 'English A1',
      slug: null,
      description: null,
      sortOrder: null,
    });
  });

  it('trims the title', () => {
    const result = validateCreateCourseRequest({ title: '  English A1  ' });

    expect(result.title).toBe('English A1');
  });

  it('rejects a missing title', () => {
    expect(() => validateCreateCourseRequest({})).toThrow(CurriculumValidationError);

    try {
      validateCreateCourseRequest({});
    } catch (error) {
      expect(error).toBeInstanceOf(CurriculumValidationError);
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.COURSE_TITLE_REQUIRED);
      expect((error as CurriculumValidationError).details).toEqual([
        { field: 'title', message: 'Course title is required' },
      ]);
    }
  });

  it('rejects a client-supplied status', () => {
    try {
      validateCreateCourseRequest({ title: 'English A1', status: 'published' });
      throw new Error('expected validation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(CurriculumValidationError);
      expect((error as CurriculumValidationError).code).toBe(CurriculumErrorCode.COURSE_INVALID_STATUS_TRANSITION);
    }
  });

  it('rejects a non-integer sortOrder', () => {
    expect(() => validateCreateCourseRequest({ title: 'English A1', sortOrder: 'first' })).toThrow(
      CurriculumValidationError,
    );
  });
});

describe('validateUpdateCourseRequest', () => {
  it('accepts a partial update payload', () => {
    const result = validateUpdateCourseRequest({ sortOrder: 2 });
    expect(result).toEqual({ sortOrder: 2 });
  });

  it('rejects an empty title on update', () => {
    expect(() => validateUpdateCourseRequest({ title: '   ' })).toThrow(CurriculumValidationError);
  });
});
