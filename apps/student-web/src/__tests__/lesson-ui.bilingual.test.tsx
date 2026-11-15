import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LessonExplanationView } from '../features/lessons/LessonExplanationView';
import { ArText, En, EnIsolated } from '../features/lessons/Bilingual';
import type { LessonExplanation } from '../features/lessons/lessonsApi';

jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({ t: (s: string) => s, formatNumber: (n: number) => String(n) }),
}));
jest.mock('../features/learner/SelectToSave', () => ({
  SelectToSave: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

const en: LessonExplanation = {
  overview: 'Say hello politely.',
  sections: [
    { heading: 'Greetings', body: 'Use Hello.', examples: [{ text: 'Good morning', note: 'Before noon' }] },
    { heading: 'Goodbyes', body: 'Use Goodbye.' },
  ],
  keyPoints: ['Start with Hello'],
  commonMistakes: [{ wrong: 'I am agree', right: 'I agree', why: 'Agree is a verb.' }],
  recap: 'Practice now.',
};
const ar: LessonExplanation = {
  overview: 'قل مرحبا بأدب.',
  sections: [
    { heading: 'التحيات', body: 'استخدم Hello.', examples: [{ text: 'صباح الخير', note: 'قبل الظهر' }] },
    { heading: 'الوداع', body: 'استخدم Goodbye.' },
  ],
  keyPoints: ['ابدأ بـ Hello'],
  commonMistakes: [{ wrong: 'أنا أوافق خطأ', right: 'أنا أوافق', why: 'الفعل agree' }],
  recap: 'تدرب الآن.',
};

const arEls = (c: HTMLElement) => Array.from(c.querySelectorAll('[lang="ar"]'));

describe('bilingual lesson explanation (UI)', () => {
  it('renders English first, Arabic underneath, with correct lang/dir on each side', () => {
    const { container } = render(<LessonExplanationView explanation={en} arExplanation={ar} />);
    const enNode = screen.getByText('Say hello politely.');
    const arNode = screen.getByText('قل مرحبا بأدب.');
    expect(enNode.closest('[lang="en"]')).toHaveAttribute('dir', 'ltr');
    expect(arNode.closest('[lang="ar"]')).toHaveAttribute('dir', 'rtl');
    expect(enNode.compareDocumentPosition(arNode) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // every Arabic string present
    for (const s of ['التحيات', 'الوداع', 'صباح الخير', 'قبل الظهر', 'ابدأ بـ Hello', 'أنا أوافق خطأ', 'تدرب الآن.']) {
      expect(screen.getByText(s, { exact: false }).closest('[lang="ar"]')).toHaveAttribute('dir', 'rtl');
    }
    // no Arabic node is ever ltr, no [lang=ar] without dir=rtl
    arEls(container).forEach((n) => expect(n).toHaveAttribute('dir', 'rtl'));
  });

  it('English vocabulary/examples/headings stay LTR (never inside an rtl ancestor)', () => {
    const { container } = render(<LessonExplanationView explanation={en} arExplanation={ar} />);
    for (const s of ['Good morning', 'Greetings', 'I agree']) {
      const node = screen.getAllByText(s, { exact: false })[0];
      const rtl = node.closest('[dir="rtl"]');
      expect(rtl).toBeNull();
    }
    expect(container.querySelectorAll('[lang="en"][dir="rtl"]').length).toBe(0);
  });

  it('missing translation: English only, no Arabic nodes, no empty boxes, no crash', () => {
    for (const a of [undefined, null, { overview: '', sections: [] } as LessonExplanation]) {
      const { container, unmount } = render(<LessonExplanationView explanation={en} arExplanation={a as never} />);
      expect(screen.getByText('Say hello politely.')).toBeInTheDocument();
      expect(arEls(container).length).toBe(0);
      unmount();
    }
  });

  it('partial translation (fewer sections/examples than English) does not crash', () => {
    const partial = { overview: 'قل مرحبا.', sections: [{ heading: 'التحيات', body: '' }] } as LessonExplanation;
    const { container } = render(<LessonExplanationView explanation={en} arExplanation={partial} />);
    expect(screen.getAllByText('Goodbyes').length).toBeGreaterThan(0);
    expect(arEls(container).length).toBeGreaterThan(0);
  });

  it('very long Arabic strings render without crashing', () => {
    const long = 'مرحبا بكم في الدرس '.repeat(2000);
    const big = { ...ar, overview: long, sections: [{ heading: long, body: long, examples: [{ text: long, note: long }] }, ar.sections[1]] } as LessonExplanation;
    const { container } = render(<LessonExplanationView explanation={en} arExplanation={big} />);
    expect(arEls(container).length).toBeGreaterThan(3);
  });

  it('English-only explanation (no arExplanation prop) is unchanged: all English present', () => {
    render(<LessonExplanationView explanation={en} />);
    for (const s of ['Say hello politely.', 'Greetings', 'Goodbyes', 'Start with Hello', 'I am agree']) {
      expect(screen.getAllByText(s, { exact: false }).length).toBeGreaterThan(0);
    }
  });
});

describe('Bilingual primitives', () => {
  it('ArText renders nothing for empty/whitespace/null, rtl+ar otherwise', () => {
    const { container, rerender } = render(<ArText text="   " />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ArText text={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ArText text="مرحبا" />);
    expect(screen.getByText('مرحبا')).toHaveAttribute('lang', 'ar');
    expect(screen.getByText('مرحبا')).toHaveAttribute('dir', 'rtl');
  });
  it('En and EnIsolated are ltr/en', () => {
    render(<><En>Hello</En><EnIsolated>World</EnIsolated></>);
    expect(screen.getByText('Hello')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('World')).toHaveAttribute('lang', 'en');
  });
});
