import { collectAcceptedValues, matchesTextAnswer, normalizeTextAnswer } from './text-answer-matching';

describe('text answer matching', () => {
  describe('collectAcceptedValues', () => {
    it('reads every stored shape', () => {
      expect(collectAcceptedValues('twelve')).toEqual(['twelve']);
      expect(collectAcceptedValues({ blanks: [{ position: 1, accepted_values: ['name', 'my name'] }], case_sensitive: false })).toEqual(['name', 'my name']);
      expect(collectAcceptedValues({ model_answer: 'He is a doctor.' })).toEqual(['He is a doctor.']);
      expect(collectAcceptedValues(['a', { text: 'b' }])).toEqual(['a', 'b']);
    });
    it('ignores empty or unknown values', () => {
      expect(collectAcceptedValues('   ')).toEqual([]);
      expect(collectAcceptedValues(null)).toEqual([]);
      expect(collectAcceptedValues(42)).toEqual([]);
      expect(collectAcceptedValues({})).toEqual([]);
    });
  });

  describe('normalizeTextAnswer', () => {
    it('ignores case, extra spaces, quotes and end punctuation', () => {
      expect(normalizeTextAnswer('  "Excuse   me!" ')).toBe('excuse me');
      expect(normalizeTextAnswer('(Name).')).toBe('name');
    });
    it('keeps case when asked to', () => {
      expect(normalizeTextAnswer('Paris', true)).toBe('Paris');
    });
  });

  describe('matchesTextAnswer', () => {
    it('matches a plain stored answer regardless of case (the "b" for "B" case)', () => {
      expect(matchesTextAnswer('b', ['B'])).toBe(true);
      expect(matchesTextAnswer(' Twelve ', ['twelve'])).toBe(true);
    });
    it('matches any accepted value of a blank, including a trailing newline from the text box', () => {
      const stored = [{ blanks: [{ position: 1, accepted_values: ['name'] }], case_sensitive: false }];
      expect(matchesTextAnswer('name\n', stored)).toBe(true);
      expect(matchesTextAnswer('game', stored)).toBe(false);
    });
    it('honours case_sensitive', () => {
      const stored = [{ blanks: [{ position: 1, accepted_values: ['Paris'] }], case_sensitive: true }];
      expect(matchesTextAnswer('Paris', stored)).toBe(true);
      expect(matchesTextAnswer('paris', stored)).toBe(false);
    });
    it('does not accept a partial answer, an empty one, or a question with no stored answer', () => {
      expect(matchesTextAnswer('excuse', ['Excuse me'])).toBe(false);
      expect(matchesTextAnswer('', ['x'])).toBe(false);
      expect(matchesTextAnswer(null, ['x'])).toBe(false);
      expect(matchesTextAnswer('anything', [])).toBe(false);
      expect(matchesTextAnswer('anything', [null, ''])).toBe(false);
    });
    it('accepts a match from any of several stored rows', () => {
      expect(matchesTextAnswer('Excuse me', ['Excuse me', { model_answer: 'excuse me' }])).toBe(true);
    });
  });
});
