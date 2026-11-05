// react-router-dom v7 cannot be loaded by CRA's Jest; like the other suites, mock it (only pure helpers are tested here).
jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: unknown }) => children,
  useNavigate: () => jest.fn(),
}));

import { cleanSelection } from '../features/learner/SelectToSave';
import { bandOf, summarizeBands } from '../features/learner/JourneyPage';
import { flatten } from '../features/learner/SearchPalette';
import { receiptHtml } from '../features/course-billing/printReceipt';
import { readDisplayPrefs, saveDisplayPrefs } from '../state/displayPrefs';
import type { StudentCourse } from '../features/curriculum/curriculumApi';
import { translate } from '../i18n';

describe('cleanSelection', () => {
  it('accepts a word or short phrase and trims punctuation', () => {
    expect(cleanSelection('  “went,” ')).toBe('went');
    expect(cleanSelection('look forward to')).toBe('look forward to');
  });
  it('rejects empty, numeric-only, and long selections', () => {
    expect(cleanSelection('   ')).toBeNull();
    expect(cleanSelection('12345')).toBeNull();
    expect(cleanSelection('one two three four five')).toBeNull();
    expect(cleanSelection('x'.repeat(61))).toBeNull();
  });
});

const course = (levelCode: string | null, lessons: number, done: number): StudentCourse => ({
  courseId: levelCode ?? 'x', title: 't', description: null, levelCode, lessonCount: lessons, completedLessonCount: done,
  quizCount: 0, examCount: 0, percent: 0, status: 'not_started', locked: false,
});

describe('journey bands', () => {
  it('maps level codes to CEFR bands', () => {
    expect(bandOf('B1.2')).toBe('B1');
    expect(bandOf('B1+')).toBe('B1');
    expect(bandOf('C2')).toBe('C2');
    expect(bandOf('Writing 1')).toBeNull();
    expect(bandOf(null)).toBeNull();
  });
  it('marks finished bands done, the first unfinished band current, the rest next', () => {
    const bands = summarizeBands([course('A1.1', 10, 10), course('A1.2', 10, 10), course('A2.1', 10, 4), course('B1.1', 10, 0), course('Writing 1', 5, 0)]);
    expect(bands.map((b) => [b.band, b.state])).toEqual([['A1', 'done'], ['A2', 'current'], ['B1', 'next']]);
    expect(bands[0].percent).toBe(100);
    expect(bands[1].percent).toBe(40);
  });
  it('marks everything done once all lessons are complete', () => {
    expect(summarizeBands([course('A1.1', 5, 5)]).every((b) => b.state === 'done')).toBe(true);
  });
});

describe('search palette rows', () => {
  it('flattens results into grouped rows with the right destinations', () => {
    const rows = flatten({
      courses: [{ id: 'c1', title: 'A1.1', levelCode: 'A1' }],
      lessons: [{ id: 'l1', title: 'Hello', courseId: 'c1', courseTitle: 'A1.1' }],
      words: [{ id: 'w1', word: 'went', meaning: null }],
    }, (s) => s);
    expect(rows.map((r) => r.to)).toEqual(['/curriculum/c1', '/lessons/l1', '/vocabulary']);
  });
});

describe('receipt', () => {
  it('escapes every value so a note or course title cannot inject markup', () => {
    const html = receiptHtml(
      { id: 'p1', courseId: 'c', courseTitle: '<img src=x onerror=alert(1)>', walletName: 'W&Co', transactionNumber: '123', originalAmount: 10, amount: 10, currency: 'USD', status: 'approved', adminNote: null, createdAt: '2026-11-05' },
      { title: 'Receipt', course: 'Course', amount: 'Amount', paidWith: 'Paid with', transaction: 'Tx', date: 'Date', reference: 'Ref', status: 'Status', statusValue: 'Approved', note: 'Note' },
      '5 Nov 2026', 'ltr');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('W&amp;Co');
  });
});

describe('display preferences', () => {
  it('round-trips and applies to <html>', () => {
    localStorage.clear();
    expect(readDisplayPrefs()).toEqual({ fontScale: 'default', reduceMotion: false });
    saveDisplayPrefs({ fontScale: 'large', reduceMotion: true });
    expect(readDisplayPrefs()).toEqual({ fontScale: 'large', reduceMotion: true });
    expect(document.documentElement.dataset.fontScale).toBe('large');
    expect(document.documentElement.dataset.motion).toBe('reduce');
  });
  it('ignores a corrupted stored value', () => {
    localStorage.setItem('aim-display-prefs', '{bad json');
    expect(readDisplayPrefs().fontScale).toBe('default');
  });
});

describe('Arabic coverage for the new screens', () => {
  it.each(['My words', 'My mistakes', 'My journey', 'Start review', 'Print receipt', 'Why are you learning English?', 'Learn English one small step a day.'])(
    '"%s" is translated', (key) => expect(translate('ar', key)).not.toBe(key));
});
