import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { LessonExplanationView } from '../features/lessons/LessonExplanationView';
import { ContentBlockRenderer } from '../features/lessons/ContentBlockRenderer';
import { SaySlide, PointsSlide, MistakesSlide } from '../features/lessons/player/SlideViews';
import { QuestionRenderer } from '../features/practice/QuestionRenderer';
import { buildSlides } from '../features/lessons/player/slides';
import type { LessonAsset, LessonExplanation } from '../features/lessons/lessonsApi';

jest.mock('react-router-dom', () => ({ Link: ({ children }: { children: unknown }) => <a>{children as never}</a> }));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({ t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])), formatNumber: (n: number) => String(n) }),
}));
jest.mock('../features/learner/SelectToSave', () => ({
  SelectToSave: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

const guide = { id: 'g', name: 'Sam' } as never;
const en: LessonExplanation = {
  overview: 'Say hello politely.',
  sections: [{ heading: 'Greetings', body: 'Use Hello.', examples: [{ text: 'Hello, I am Sara.', note: 'Intro' }] }],
  keyPoints: ['Start with Hello'],
  commonMistakes: [{ wrong: 'I am agree', right: 'I agree', why: 'Agree is a verb.' }],
  recap: 'Practice now.',
};
const ar: LessonExplanation = {
  overview: 'قل مرحبا بأدب.',
  sections: [{ heading: 'التحيات', body: 'استخدم Hello.', examples: [{ text: 'مرحبا، أنا سارة.', note: 'تعريف' }] }],
  keyPoints: ['ابدأ بـ Hello'],
  commonMistakes: [{ wrong: 'خطأ', right: 'صحيح', why: 'لأن agree فعل.' }],
  recap: 'تدرب الآن.',
};
const asset = (over: Partial<LessonAsset> = {}): LessonAsset => ({
  id: 'a1', lessonId: 'l', type: 'text', title: 'Going To', description: 'I am going to travel.', url: null, mimeType: null, sizeBytes: null,
  durationSeconds: null, altText: null, thumbnailUrl: null, order: 1, status: 'published', metadata: null, createdAt: '', updatedAt: '', ...over,
});

describe('LessonExplanationView bilingual', () => {
  it('shows Arabic under English with lang/dir attributes', () => {
    const { container } = render(<LessonExplanationView explanation={en} arExplanation={ar} />);
    const arEl = screen.getByText('قل مرحبا بأدب.');
    expect(arEl).toHaveAttribute('dir', 'rtl');
    expect(arEl).toHaveAttribute('lang', 'ar');
    const enEl = screen.getByText('Say hello politely.');
    expect(enEl).toHaveAttribute('dir', 'ltr');
    expect(enEl).toHaveAttribute('lang', 'en');
    expect(enEl.compareDocumentPosition(arEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const txt of ['التحيات', 'مرحبا، أنا سارة.', 'تعريف', 'ابدأ بـ Hello', 'خطأ', 'صحيح', 'لأن agree فعل.', 'تدرب الآن.']) {
      expect(screen.getByText(txt)).toHaveAttribute('dir', 'rtl');
    }
    expect(container.querySelectorAll('[lang="ar"]').length).toBeGreaterThanOrEqual(9);
  });

  it('degrades to English only with no translation or a partial one', () => {
    const { container, rerender } = render(<LessonExplanationView explanation={en} />);
    expect(container.querySelector('[lang="ar"]')).toBeNull();
    rerender(<LessonExplanationView explanation={en} arExplanation={{ overview: '  ', sections: [], keyPoints: [], recap: undefined } as never} />);
    expect(container.querySelector('[lang="ar"]')).toBeNull();
    expect(screen.getByText('Hello, I am Sara.')).toBeInTheDocument();
  });
});

describe('buildSlides translations', () => {
  const labels = { keyPoints: 'K', recap: 'R', mistakes: 'M' };
  it('pairs Arabic by position and keeps the slide order unchanged', () => {
    const base = buildSlides({ description: 'd', explanation: en }, [asset()], labels);
    const withAr = buildSlides({ description: 'd', explanation: en, translations: { ar: { title: 'عنوان', explanation: ar, assets: { a1: { title: 'ذاهب إلى' } } } } }, [asset()], labels);
    expect(withAr.map((s) => s.kind)).toEqual(base.map((s) => s.kind));
    expect(withAr[0]).toMatchObject({ kind: 'intro', arTitle: 'عنوان' });
    expect(withAr[2]).toMatchObject({ ar: { title: 'التحيات', body: 'استخدم Hello.' }, examples: [{ ar: { text: 'مرحبا، أنا سارة.' } }] });
    expect(withAr.find((s) => s.kind === 'asset')).toMatchObject({ ar: { title: 'ذاهب إلى' } });
  });
  it('has no ar fields without translations', () => {
    const s = buildSlides({ description: 'd', explanation: en }, [], labels);
    expect(s.every((x) => !('ar' in x) || (x as { ar?: unknown }).ar === undefined)).toBe(true);
  });
});

describe('slide views', () => {
  it('SaySlide renders Arabic title/body under English, and nothing extra without it', () => {
    const { container, rerender } = render(<SaySlide guide={guide} title="Greetings" body="Use Hello." examples={[{ text: 'Hello', ar: { text: 'مرحبا', note: 'ملاحظة' } }]} ar={{ title: 'التحيات', body: 'استخدم Hello.' }} />);
    expect(screen.getByText('التحيات')).toHaveAttribute('lang', 'ar');
    expect(screen.getByText('مرحبا')).toHaveAttribute('dir', 'rtl');
    expect(container.querySelector('bdi[dir="ltr"]')?.textContent).toBe('Hello');
    rerender(<SaySlide guide={guide} title="Greetings" body="Use Hello." examples={[{ text: 'Hello' }]} />);
    expect(container.querySelector('[lang="ar"]')).toBeNull();
  });
  it('PointsSlide and MistakesSlide show Arabic supports', () => {
    const { container } = render(<><PointsSlide guide={guide} title="K" points={['One', 'Two']} arPoints={['واحد', '']} /><MistakesSlide guide={guide} title="M" items={[{ ...en.commonMistakes![0], ar: { why: 'لأن' } }]} /></>);
    expect(screen.getByText('واحد')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('لأن')).toHaveAttribute('lang', 'ar');
    expect(container.querySelectorAll('[lang="ar"]')).toHaveLength(2);
  });
});

describe('ContentBlockRenderer bilingual', () => {
  const wrap = (el: React.ReactElement) => render(el);
  it('uses asset.translations.ar, and an explicit ar prop wins', () => {
    const a = asset({ translations: { ar: { title: 'ذاهب إلى', description: 'سأسافر.' } } });
    const { rerender } = wrap(<ContentBlockRenderer asset={a} stepNumber={1} />);
    expect(screen.getByText('ذاهب إلى')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('سأسافر.').closest('[lang="ar"]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('Going To')).toHaveAttribute('lang', 'en');
    rerender(<ContentBlockRenderer asset={a} stepNumber={1} ar={{ title: 'بديل' }} />);
    expect(screen.getByText('بديل')).toBeInTheDocument();
  });
  it('is English only when there is no translation', () => {
    const { container } = wrap(<ContentBlockRenderer asset={asset()} stepNumber={1} />);
    expect(container.querySelector('[lang="ar"]')).toBeNull();
  });
});

describe('QuestionRenderer bilingual', () => {
  const q = (over = {}) => ({
    id: 'q1', type: 'multiple_choice', stem: 'Pick the verb', difficulty: '', tags: [],
    options: [{ id: 'o1', text: 'run', order: 0, translations: { ar: { text: 'يركض' } } }, { id: 'o2', text: 'red', order: 1 }],
    translations: { ar: { stem: 'اختر الفعل' } }, ...over,
  });
  it('shows Arabic stem and option gloss; answer logic unchanged', () => {
    const onChange = jest.fn();
    render(<QuestionRenderer question={q()} selectedAnswer="" onAnswerChange={onChange} disabled={false} />);
    expect(screen.getByText('اختر الفعل')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('يركض')).toHaveAttribute('lang', 'ar');
    within(screen.getByText('run').closest('label')!).getByRole('radio').click();
    expect(onChange).toHaveBeenCalledWith('o1');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
  it('fill-in stays a plain English input; missing translations leave no Arabic', () => {
    const { container } = render(<QuestionRenderer question={q({ type: 'fill_in_the_blank', options: [], translations: undefined })} selectedAnswer="" onAnswerChange={() => {}} disabled={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(container.querySelector('[lang="ar"]')).toBeNull();
  });
});
