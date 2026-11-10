import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonExplanationView } from '../features/lessons/LessonExplanationView';

jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({ t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])) }),
}));
jest.mock('../features/learner/SelectToSave', () => ({
  SelectToSave: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

describe('LessonExplanationView', () => {
  it('renders overview, sections with examples, key points, mistakes and recap', () => {
    render(
      <LessonExplanationView
        explanation={{
          overview: 'You will learn to introduce yourself politely in English.',
          sections: [
            { heading: 'Saying hello', body: 'Use **Hello** with everyone.', examples: [{ text: 'Hello, I am Sara.', note: 'A simple introduction' }] },
            { heading: 'Asking names', body: 'Ask politely.' },
          ],
          keyPoints: ['Start with Hello'],
          commonMistakes: [{ wrong: 'I am agree', right: 'I agree', why: 'Agree is already a verb.' }],
          recap: 'Now practice.',
        }}
      />,
    );
    expect(screen.getByText('You will learn to introduce yourself politely in English.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saying hello' })).toBeInTheDocument();
    expect(screen.getByText('Hello, I am Sara.')).toBeInTheDocument();
    expect(screen.getByText('Start with Hello')).toBeInTheDocument();
    expect(screen.getByText('I am agree')).toBeInTheDocument();
    expect(screen.getByText('I agree')).toBeInTheDocument();
    expect(screen.getByText(/Now practice\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /1\. Saying hello/ })).toHaveAttribute('href', '#lesson-section-1');
  });
});

describe('LessonExplanationView speech', () => {
  const setup = () => {
    const speak = jest.fn();
    (window as unknown as Record<string, unknown>).speechSynthesis = { speak, cancel: jest.fn(), getVoices: () => [] };
    const Utt = function (this: { text: string }, text: string) { this.text = text; };
    (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance = Utt;
    (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = Utt;
    return speak;
  };
  const view = (examples: { text: string }[]) =>
    render(<LessonExplanationView explanation={{ overview: 'Overview text that is long enough to read here.', sections: [{ heading: 'A', body: 'Body body body body body body body body body body.', examples }], keyPoints: ['k'] }} />);

  it('a short item gets a speaker that says only that item (letters by name)', () => {
    const speak = setup();
    view([{ text: 'A a' }, { text: 'Seven' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Hear “Seven”' }));
    expect(speak.mock.calls[0][0].text).toBe('Seven');
    fireEvent.click(screen.getAllByRole('button', { name: 'Hear “A”' })[0]);
    expect(speak.mock.calls[1][0].text).toBe('ay');
  });

  it('in a sentence, tapping a word says only that word', () => {
    const speak = setup();
    view([{ text: 'She is a good doctor.' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Hear “doctor”' }));
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toBe('doctor');
  });
});
