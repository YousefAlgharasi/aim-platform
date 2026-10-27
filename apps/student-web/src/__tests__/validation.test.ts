import {
  collectErrors,
  hasErrors,
  mapApiFieldErrors,
  validateConfirm,
  validateEmail,
  validateMaxLength,
  validateNewPassword,
  validateRequired,
} from '../utils/validation';

describe('validators', () => {
  it('rejects empty and whitespace-only required values', () => {
    expect(validateRequired('', 'req')).toBe('req');
    expect(validateRequired('   ', 'req')).toBe('req');
    expect(validateRequired(' a ', 'req')).toBeUndefined();
  });

  it('validates email format after trimming', () => {
    expect(validateEmail('')).toBeTruthy();
    expect(validateEmail('   ')).toBeTruthy();
    expect(validateEmail('plain')).toBeTruthy();
    expect(validateEmail('a@b')).toBeTruthy();
    expect(validateEmail('a b@c.com')).toBeTruthy();
    expect(validateEmail('  user@example.com  ')).toBeUndefined();
  });

  it('enforces the 8 character password minimum at the boundary', () => {
    expect(validateNewPassword('')).toBeTruthy();
    expect(validateNewPassword('1234567')).toBeTruthy();
    expect(validateNewPassword('12345678')).toBeUndefined();
  });

  it('checks password confirmation', () => {
    expect(validateConfirm('abcdefgh', '')).toBeTruthy();
    expect(validateConfirm('abcdefgh', 'abcdefgx')).toBeTruthy();
    expect(validateConfirm('abcdefgh', 'abcdefgh')).toBeUndefined();
  });

  it('enforces max length on trimmed text, inclusive', () => {
    expect(validateMaxLength('abc', 3, 'long')).toBeUndefined();
    expect(validateMaxLength('abcd', 3, 'long')).toBe('long');
    expect(validateMaxLength('abc   ', 3, 'long')).toBeUndefined();
  });

  it('collects errors and detects them', () => {
    const errors = collectErrors({ a: undefined, b: 'bad' });
    expect(errors).toEqual({ b: 'bad' });
    expect(hasErrors(errors)).toBe(true);
    expect(hasErrors({})).toBe(false);
  });

  it('maps backend class-validator details to fields', () => {
    const err = { details: ['email must be an email', 'password must be longer than or equal to 8 characters', 'other thing'] };
    expect(mapApiFieldErrors(err, ['email', 'password'] as const)).toEqual({
      email: 'Enter a valid email address.',
      password: 'Must be at least 8 characters.',
    });
    expect(mapApiFieldErrors(new Error('x'), ['email'] as const)).toEqual({});
    expect(mapApiFieldErrors({ details: [1, null] }, ['email'] as const)).toEqual({});
  });
});
