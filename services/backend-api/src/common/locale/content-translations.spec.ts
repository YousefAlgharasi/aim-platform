import { choiceTranslations, questionTranslations, withTranslations } from './content-translations';

describe('questionTranslations', () => {
  it('returns ar stem and hint, dropping explanation and unknown locales', () => {
    expect(
      questionTranslations({ ar: { stem: 'ما هو؟', hint: 'تلميح', explanation: 'x' }, fr: { stem: 'Quoi' }, en: { stem: 'What' } }),
    ).toEqual({ ar: { stem: 'ما هو؟', hint: 'تلميح' } });
  });
  it('omits when absent or malformed', () => {
    expect(questionTranslations(null)).toBeUndefined();
    expect(questionTranslations('x')).toBeUndefined();
    expect(questionTranslations([])).toBeUndefined();
    expect(questionTranslations({ ar: { stem: '  ' } })).toBeUndefined();
    expect(questionTranslations({ ar: 5 })).toBeUndefined();
  });
});

describe('choiceTranslations', () => {
  it('returns ar text', () => {
    expect(choiceTranslations({ ar: { text: 'ب' } }, 'multiple_choice')).toEqual({ ar: { text: 'ب' } });
  });
  it('never translates true/false labels', () => {
    expect(choiceTranslations({ ar: { text: 'صحيح' } }, 'true_false')).toBeUndefined();
  });
  it('omits when absent', () => {
    expect(choiceTranslations(null, 'multiple_choice')).toBeUndefined();
  });
});

describe('withTranslations', () => {
  it('spreads nothing when undefined', () => {
    expect({ a: 1, ...withTranslations(undefined) }).toEqual({ a: 1 });
    expect({ a: 1, ...withTranslations({ ar: { text: 'x' } }) }).toEqual({ a: 1, translations: { ar: { text: 'x' } } });
  });
});

describe('explanationTranslations / optionsWithTranslations / titleTranslations', () => {
  const { explanationTranslations, optionsWithTranslations, titleTranslations } = require('./content-translations');
  it('explanationTranslations keeps non-empty non-English explanations only', () => {
    expect(explanationTranslations({ ar: { explanation: 'x' }, en: { explanation: 'e' } })).toEqual({ ar: { explanation: 'x' } });
    expect(explanationTranslations({ ar: { explanation: ' ' } })).toBeUndefined();
    expect(explanationTranslations('bad')).toBeUndefined();
    expect(explanationTranslations(null)).toBeUndefined();
  });
  it('optionsWithTranslations is additive and omits true/false', () => {
    const opts = [{ id: 'a', text: 'A', translations: { ar: { text: 'ا' } } }, { id: 'b', text: 'B' }];
    expect(optionsWithTranslations(opts, 'multiple_choice')).toEqual([{ id: 'a', text: 'A', translations: { ar: { text: 'ا' } } }, { id: 'b', text: 'B' }]);
    expect(optionsWithTranslations(opts, 'true_false')).toEqual([{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }]);
  });
  it('titleTranslations skips malformed rows and English', () => {
    expect(titleTranslations([{ locale: 'ar', title: 'ت', description: 'و' }, { locale: 'en', title: 'E' }, null, 5])).toEqual({ ar: { title: 'ت', description: 'و' } });
    expect(titleTranslations('x')).toBeUndefined();
    expect(titleTranslations([{ locale: 'ar', title: '' }])).toBeUndefined();
  });
});
