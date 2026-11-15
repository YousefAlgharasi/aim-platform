import { validateLessonContent } from './lesson-content.validation';

const ASSET = '8ee48577-40c7-488d-93d3-57846b923981';
const valid = () => ({
  explanation: {
    overview: 'نظرة عامة',
    sections: [{ heading: 'ع', body: 'نص', examples: [{ text: 'B', note: 'ملاحظة' }] }],
    keyPoints: ['نقطة'],
    commonMistakes: [{ wrong: 'a', right: 'b', why: 'لأن' }],
    recap: 'ملخص',
  },
  teachingOutline: ['خطوة'],
  assets: { [ASSET]: { title: 'عنوان', description: 'وصف' } },
});

describe('validateLessonContent', () => {
  it('accepts a full valid content object and null', () => {
    expect(validateLessonContent(valid())).toEqual(valid());
    expect(validateLessonContent(null)).toBeNull();
    expect(validateLessonContent({})).toEqual({});
  });

  it.each([
    ['non-object', 'x'],
    ['array', []],
    ['unknown top-level key', { ...valid(), extra: 1 }],
    ['unknown explanation key', { explanation: { ...valid().explanation, extra: 1 } }],
    ['missing overview', { explanation: { sections: [], keyPoints: [] } }],
    ['sections not array', { explanation: { overview: 'a', sections: 'x', keyPoints: [] } }],
    ['empty key point', { explanation: { overview: 'a', sections: [], keyPoints: [''] } }],
    ['bad asset key', { assets: { nope: { title: 't' } } }],
    ['asset metadata not object', { assets: { [ASSET]: { metadata: 'x' } } }],
    ['outline not strings', { teachingOutline: [1] }],
  ])('rejects %s with a 400', (_name, input) => {
    expect(() => validateLessonContent(input)).toThrow(/Invalid translation content/);
  });

  it('rejects oversized content', () => {
    expect(() => validateLessonContent({ teachingOutline: Array.from({ length: 121 }, () => 'x') })).toThrow(/at most/);
    const huge = { explanation: { overview: 'x', keyPoints: [], sections: Array.from({ length: 40 }, () => ({ heading: 'h', body: 'x'.repeat(10000) })) } };
    expect(() => validateLessonContent(huge)).toThrow(/at most 200000 bytes/);
  });
});
