jest.mock('../api/client', () => ({ apiClient: {} }));
import { PRACTICE_MODES, isPracticeMode } from '../features/practice/skillPracticeApi';

describe('skill practice modes', () => {
  it('offers grammar, listening and reading', () => {
    expect(PRACTICE_MODES).toEqual(['grammar', 'listening', 'reading']);
  });
  it('only accepts those three modes from the URL', () => {
    expect(isPracticeMode('grammar')).toBe(true);
    expect(isPracticeMode('reading')).toBe(true);
    for (const bad of ['speaking', 'writing', '', undefined, 'Grammar', '../x']) expect(isPracticeMode(bad as string | undefined)).toBe(false);
  });
});
