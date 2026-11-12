import { buildSlides } from '../features/lessons/player/slides';
import type { LessonAsset } from '../features/lessons/lessonsApi';

const asset = (over: Partial<LessonAsset>): LessonAsset => ({
  id: 'a', lessonId: 'l', type: 'text', title: 'T', description: null, url: null, mimeType: null, sizeBytes: null, durationSeconds: null,
  altText: null, thumbnailUrl: null, order: 1, status: 'published', metadata: null, createdAt: '', updatedAt: '', ...over,
});
const labels = { keyPoints: 'Key points', recap: 'Recap', mistakes: 'Common mistakes' };
const kinds = (s: { kind: string }[]) => s.map((x) => x.kind);

describe('buildSlides', () => {
  it('turns a written explanation into cards, then lists every step', () => {
    const audio = asset({ id: 'au', type: 'audio', title: 'Listen' });
    const slides = buildSlides({
      description: 'd',
      explanation: {
        overview: 'Overview',
        sections: [{ heading: 'Form', body: 'Use am.', examples: [{ text: 'I am happy.', note: 'simple' }] }, { heading: 'Empty', body: ' ' }],
        keyPoints: ['One'],
        commonMistakes: [{ wrong: 'I am agree', right: 'I agree', why: 'Agree is a verb.' }],
        recap: 'Done.',
      },
    }, [audio, asset({ id: 'tx', description: 'text step' })], labels);
    expect(kinds(slides)).toEqual(['intro', 'say', 'say', 'points', 'mistakes', 'say', 'asset', 'asset', 'finish']);
    expect(slides[2]).toMatchObject({ title: 'Form', examples: [{ text: 'I am happy.', note: 'simple' }] });
  });

  it('without an explanation: description first, text steps talk, other steps keep their order', () => {
    const slides = buildSlides({ description: 'About going to.', explanation: null }, [
      asset({ id: '1', title: 'Going To', description: 'I am going to travel.' }),
      asset({ id: '2', type: 'audio' }),
      asset({ id: '3', title: 'Empty', description: '' }),
      asset({ id: '4', type: 'exercise' }),
    ], labels);
    expect(kinds(slides)).toEqual(['intro', 'say', 'say', 'asset', 'asset', 'finish']);
    expect(slides[2]).toMatchObject({ title: 'Going To', body: 'I am going to travel.' });
  });

  it('a lesson with nothing in it is just intro and finish', () => {
    expect(kinds(buildSlides({ description: '', explanation: null }, [], labels))).toEqual(['intro', 'finish']);
  });
});
