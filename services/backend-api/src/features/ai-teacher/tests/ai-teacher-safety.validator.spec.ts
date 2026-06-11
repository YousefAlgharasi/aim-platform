import { AiTeacherSafetyValidator } from '../ai-teacher-safety.validator';
import { AiTeacherValidationStatus } from '../interfaces/ai-teacher-contracts.interface';

describe('AiTeacherSafetyValidator', () => {
  let validator: AiTeacherSafetyValidator;

  beforeEach(() => {
    validator = new AiTeacherSafetyValidator();
  });

  it('passes a safe, short response with no leakage', () => {
    const result = validator.validate(
      'This sentence uses a verb to describe an action.',
      'What is a verb?',
      null,
    );
    expect(result.passed).toBe(true);
    expect(result.status).toBe(AiTeacherValidationStatus.PASSED);
  });

  it('fails when response exceeds 150 words', () => {
    const longText = 'word '.repeat(151).trim();
    const result = validator.validate(longText, null, null);
    expect(result.passed).toBe(false);
    expect(result.status).toBe(AiTeacherValidationStatus.FAILED_EXCESSIVE_LENGTH);
  });

  it('fails when response contains prohibited language', () => {
    const result = validator.validate('This is a hate speech example.', null, null);
    expect(result.passed).toBe(false);
    expect(result.status).toBe(AiTeacherValidationStatus.FAILED_PROHIBITED_LANGUAGE);
  });

  it('fails when response leaks the correct answer', () => {
    const result = validator.validate(
      'The answer is "runs" because it is a verb.',
      'Which word is a verb?',
      'runs',
    );
    expect(result.passed).toBe(false);
    expect(result.status).toBe(AiTeacherValidationStatus.FAILED_ANSWER_LEAKAGE);
  });

  it('passes when response discusses the topic without revealing the exact answer', () => {
    const result = validator.validate(
      'A verb describes an action or a state of being. Look for the word that shows what the subject is doing.',
      'Which word is a verb?',
      'runs',
    );
    expect(result.passed).toBe(true);
    expect(result.status).toBe(AiTeacherValidationStatus.PASSED);
  });
});
