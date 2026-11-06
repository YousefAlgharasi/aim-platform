// react-router-dom v7 cannot be loaded by CRA's Jest; like the other suites, mock it (only pure helpers are tested here).
jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: unknown }) => children,
  useNavigate: () => jest.fn(),
}));

import { cleanSelection } from '../features/learner/SelectToSave';
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
